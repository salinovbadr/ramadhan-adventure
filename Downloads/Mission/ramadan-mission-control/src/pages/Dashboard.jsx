import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Rocket } from 'lucide-react';
import { getRamadanDay, calculateMissionXP, DIFFICULTY_LEVELS, getRank, PHASES } from '../utils/missions';
import { getMissionIcon, IconCheck } from '../components/icons/MissionIcons';

export default function Dashboard({ onNavigate }) {
    const { activeUser, crew, getMissionLog, allMissions, settings, getTotalStars, getPerfectStreak, getTeamTotalStars, getTeamMaxStars, saveDayLog } = useApp();
    const today = new Date().toISOString().split('T')[0];
    const currentRamadanDay = getRamadanDay(today);
    const [selectedDay, setSelectedDay] = useState(currentRamadanDay);
    const daySelectRef = useRef(null);
    const [selectedCrewId, setSelectedCrewId] = useState(null); // null = show all

    const [prayerStatus, setPrayerStatus] = useState({
        loading: true,
        error: null,
        locationLabel: null,
        timings: null,
        nextPrayer: null,
    });

    const [nowTick, setNowTick] = useState(Date.now());

    // Stats
    const log = getMissionLog(activeUser?.id);
    const dayLog = log[selectedDay] || {};

    const difficulty = activeUser?.difficulty || 'cadet';
    const multiplier = DIFFICULTY_LEVELS[difficulty]?.multiplier || 1;

    const enabledMissions = useMemo(() => {
        // If no enabledMissions setting exists, show all missions
        if (!settings.enabledMissions || settings.enabledMissions.length === 0) {
            return allMissions;
        }
        
        const filtered = allMissions.filter(m => settings.enabledMissions.includes(m.id));
        return filtered;
    }, [settings.enabledMissions, allMissions]);

    const isMissionActiveOnDay = (mission, day) => {
        if (!mission?.activeDays) return true;
        if (Array.isArray(mission.activeDays) && mission.activeDays.length === 0) return true;
        if (!Array.isArray(mission.activeDays)) return true;
        return mission.activeDays.includes(day);
    };

    const isMissionApplicableToMember = (mission, memberId) => {
        if (mission.assignedTo === undefined || mission.assignedTo === null) return true;
        if (Array.isArray(mission.assignedTo)) return mission.assignedTo.includes(memberId);
        return true;
    };

    const withMemberOverrides = (mission, memberId) => {
        const perCrew = mission.perCrew?.[memberId];
        if (!perCrew) return mission;
        return {
            ...mission,
            defaultTarget: perCrew.defaultTarget ?? mission.defaultTarget,
            unit: perCrew.unit ?? mission.unit,
        };
    };

    const sortMissions = (missions) => {
        return [...missions].sort((a, b) => {
            // Primary sort by order property
            const ao = Number.isFinite(a.order) ? a.order : 999;
            const bo = Number.isFinite(b.order) ? b.order : 999;
            if (ao !== bo) return ao - bo;
            
            // Secondary sort by name
            return String(a.name || '').localeCompare(String(b.name || ''));
        });
    };

    const buildMissionValues = (memberId, memberMissions, patchFn) => {
        const currentLog = getMissionLog(memberId);
        const currentDay = currentLog[selectedDay] || {};
        const existingMissions = currentDay.missions || {};

        const missionValues = {};
        memberMissions.forEach(m => {
            const v = existingMissions[m.id]?.value;
            if (m.type === 'boolean') {
                missionValues[m.id] = v ?? false;
            } else {
                missionValues[m.id] = v ? safePartialValue(v, m) : { target: m.defaultTarget || 20, achieved: 0 };
            }
        });

        patchFn?.(missionValues);
        return missionValues;
    };
    const handleQuickToggle = (memberId, memberMissions, missionId) => {
        const missionValues = buildMissionValues(memberId, memberMissions, (vals) => {
            vals[missionId] = !vals[missionId];
        });
        saveDayLog(memberId, selectedDay, missionValues);
    };
    const handleQuickPartialChange = (memberId, memberMissions, missionId, field, value) => {
        const missionValues = buildMissionValues(memberId, memberMissions, (vals) => {
            const current = vals[missionId] || { target: 0, achieved: 0 };
            vals[missionId] = {
                ...current,
                [field]: Math.max(0, parseInt(value) || 0),
            };
        });
        saveDayLog(memberId, selectedDay, missionValues);
    };
    const safePartialValue = (val, mission) => {
        if (!val || typeof val !== 'object') return { target: mission.defaultTarget || 20, achieved: 0 };
        const target = Number.isFinite(val.target) && val.target > 0 ? val.target : (mission.defaultTarget || 20);
        const achieved = Number.isFinite(val.achieved) && val.achieved >= 0 ? val.achieved : 0;
        return { target, achieved };
    };

    // Calculate Daily Progress
    const dailyProgress = useMemo(() => {
        let earned = 0;
        let total = 0;
        const activeMissions = enabledMissions.filter(m => isMissionApplicableToMember(m, activeUser?.id) && isMissionActiveOnDay(m, selectedDay));
        activeMissions.forEach(m => {
            total += Math.round(m.baseXP * multiplier);
            if (dayLog.missions?.[m.id]) {
                const val = dayLog.missions[m.id].value;
                const safeVal = m.type === 'partial' ? safePartialValue(val, m) : val;
                earned += calculateMissionXP(m, safeVal, difficulty);
            }
        });
        return { earned, total, percent: total > 0 ? (earned / total) * 100 : 0 };
    }, [enabledMissions, dayLog, multiplier, difficulty, selectedDay]);

    const activePilotStats = useMemo(() => {
        const activeMissions = enabledMissions.filter(m => isMissionApplicableToMember(m, activeUser?.id) && isMissionActiveOnDay(m, selectedDay));
        let completed = 0;
        activeMissions.forEach(m => {
            const v = dayLog.missions?.[m.id]?.value;
            if (m.type === 'boolean') {
                if (v) completed++;
            } else {
                const safeVal = safePartialValue(v, m);
                if (safeVal.achieved >= safeVal.target && safeVal.target > 0) completed++;
            }
        });
        return { completed, total: activeMissions.length };
    }, [enabledMissions, dayLog, activeUser?.id, selectedDay]);

    const flightStatus = useMemo(() => {
        const day = selectedDay;
        const dayPercent = Math.round(((day - 1) / 29) * 100);
        const phase = PHASES.find(p => day >= p.days[0] && day <= p.days[1]) || PHASES[0];

        const teamStars = getTeamTotalStars();
        const goal = getTeamMaxStars();
        const starPercent = goal > 0 ? Math.min(100, Math.round((teamStars / goal) * 100)) : 0;

        return { day, dayPercent, starPercent, phase, teamStars, goal };
    }, [selectedDay, getTeamTotalStars, getTeamMaxStars]);

    useEffect(() => {
        setSelectedDay(currentRamadanDay);
    }, [currentRamadanDay]);

    useEffect(() => {
        const t = setInterval(() => setNowTick(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const parseTime = (timeStr) => {
            if (!timeStr) return null;
            const cleaned = String(timeStr).split(' ')[0];
            const [h, m] = cleaned.split(':').map(n => parseInt(n, 10));
            if (Number.isNaN(h) || Number.isNaN(m)) return null;
            const d = new Date();
            d.setHours(h, m, 0, 0);
            return d;
        };

        const computeNext = (timings) => {
            const order = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            const now = new Date();
            const todayTimes = order
                .map(name => ({ name, time: parseTime(timings?.[name]) }))
                .filter(x => x.time);
            const next = todayTimes.find(x => x.time.getTime() > now.getTime());
            if (next) return next;
            if (todayTimes[0]) {
                const tomorrow = new Date(todayTimes[0].time);
                tomorrow.setDate(tomorrow.getDate() + 1);
                return { name: todayTimes[0].name, time: tomorrow };
            }
            return null;
        };

        const update = async () => {
            setPrayerStatus(s => ({ ...s, loading: true, error: null }));

            if (!navigator.geolocation) {
                setPrayerStatus({ loading: false, error: 'Geolocation not supported', locationLabel: null, timings: null, nextPrayer: null });
                return;
            }

            navigator.geolocation.getCurrentPosition(async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const url = `https://api.aladhan.com/v1/timings?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&method=11`;
                    const res = await fetch(url);
                    const json = await res.json();
                    const timings = json?.data?.timings || null;
                    const meta = json?.data?.meta || {};
                    const label = meta?.timezone || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
                    const nextPrayer = computeNext(timings);
                    if (cancelled) return;
                    setPrayerStatus({ loading: false, error: null, locationLabel: label, timings, nextPrayer });
                } catch (e) {
                    if (cancelled) return;
                    setPrayerStatus({ loading: false, error: 'Failed to load prayer times', locationLabel: null, timings: null, nextPrayer: null });
                }
            }, () => {
                if (cancelled) return;
                setPrayerStatus({ loading: false, error: 'Location permission denied', locationLabel: null, timings: null, nextPrayer: null });
            }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 });
        };

        update();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!prayerStatus.timings) return;
        const order = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const timings = prayerStatus.timings;
        const now = new Date(nowTick);
        const parse = (timeStr) => {
            if (!timeStr) return null;
            const cleaned = String(timeStr).split(' ')[0];
            const [h, m] = cleaned.split(':').map(n => parseInt(n, 10));
            if (Number.isNaN(h) || Number.isNaN(m)) return null;
            const d = new Date(now);
            d.setHours(h, m, 0, 0);
            return d;
        };
        const list = order.map(name => ({ name, time: parse(timings[name]) })).filter(x => x.time);
        const next = list.find(x => x.time.getTime() > now.getTime());
        const nextPrayer = next || (list[0] ? { name: list[0].name, time: new Date(list[0].time.getTime() + 24 * 60 * 60 * 1000) } : null);
        setPrayerStatus(s => ({ ...s, nextPrayer }));
    }, [nowTick]);

    if (!activeUser) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-2">
                    <p className="text-slate-400 text-lg">No active crew member</p>
                    <p className="text-slate-500 text-sm">Create a crew member in onboarding to begin.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Flight Status Timeline */}
            <section className="glass-panel rounded-[1.5rem] p-6 lg:p-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Current Flight Status</h3>
                        <p className="text-xs text-slate-500">Phase: <span className="text-white font-bold">{flightStatus.phase.name}</span></p>
                    </div>
                    <div className="text-xs font-bold text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                        Day {flightStatus.day} of 30
                    </div>
                </div>

                <div className="relative">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-accent-purple" style={{ width: `${flightStatus.starPercent}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500">
                        <span>Mission Points</span>
                        <span className="text-slate-300 font-bold">{flightStatus.teamStars} / {flightStatus.goal}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-4 text-[10px] uppercase tracking-widest">
                        <div className="text-slate-500">Day 1</div>
                        <div className="text-center" style={{ color: PHASES[0].color }}>Rahmat</div>
                        <div className="text-center" style={{ color: PHASES[1].color }}>Maghfirah</div>
                        <div className="text-right" style={{ color: PHASES[2].color }}>Itqun Minan Nar</div>
                    </div>
                </div>
            </section>

            {/* Header */}
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">Mission Log</h1>
                    <p className="text-slate-400 flex items-center gap-2">
                        <span className="inline-block size-2 rounded-full bg-green-500 animate-pulse"></span>
                        Log Current Flight Telemetry
                    </p>
                </div>
                <div className="hidden md:block text-right">
                    <div className="text-accent-gold text-2xl font-bold font-mono">
                        {prayerStatus.nextPrayer?.time
                            ? prayerStatus.nextPrayer.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '--:--'}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest">
                        {prayerStatus.loading
                            ? 'Loading Prayer Times'
                            : (prayerStatus.nextPrayer ? `Next: ${prayerStatus.nextPrayer.name}` : 'Prayer Times')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
                {/* Main Column - Daily Tasks */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <section className="glass-panel rounded-[1.5rem] p-6 lg:p-8 flex-grow relative overflow-hidden">
                        {/* Decorative Blur */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-3">
                                    <span className="flex items-center justify-center size-8 rounded-lg bg-primary/20 text-primary border border-primary/30">
                                        <Rocket size={18} />
                                    </span>
                                    Daily Mission Log
                                </h3>
                                {crew.length > 1 && (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCrewId(null)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${selectedCrewId === null ? 'bg-primary/20 text-white border-primary/30' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}
                                        >
                                            All Crew
                                        </button>
                                        {crew.map(m => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setSelectedCrewId(m.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${selectedCrewId === m.id ? 'bg-primary/20 text-white border-primary/30' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}
                                            >
                                                {m.callsign}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {activePilotStats.total > 0 && (
                                    <div className="text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                        {activePilotStats.completed}/{activePilotStats.total} Completed
                                    </div>
                                )}
                                <div
                                    className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 cursor-pointer"
                                    onClick={(e) => {
                                        // Clicking the pill should open the picker, but do not block native select interaction.
                                        if (e.target === daySelectRef.current) return;
                                        const el = daySelectRef.current;
                                        if (!el) return;
                                        el.focus();
                                        if (typeof el.showPicker === 'function') el.showPicker();
                                    }}
                                >
                                    <span className="hidden lg:inline">Ramadan Day</span>
                                    <select
                                        ref={daySelectRef}
                                        className="bg-transparent outline-none text-slate-200"
                                        value={selectedDay}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => setSelectedDay(parseInt(e.target.value) || 1)}
                                    >
                                        {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                                            <option key={d} value={d} className="bg-[#131b21]">{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {crew.filter(m => selectedCrewId === null || m.id === selectedCrewId).map(member => {
                                const memberLog = getMissionLog(member.id);
                                const memberDayLog = memberLog[selectedDay] || {};
                                const memberDifficulty = member.difficulty || 'cadet';
                                const memberMultiplier = DIFFICULTY_LEVELS[memberDifficulty]?.multiplier || 1;
                                const memberMissions = sortMissions(enabledMissions
                                    .filter(m => isMissionApplicableToMember(m, member.id) && isMissionActiveOnDay(m, selectedDay))
                                    .map(m => withMemberOverrides(m, member.id)));

                                return (
                                    <div key={member.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:p-5 max-h-[70vh] overflow-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                                                    {member.callsign?.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold">{member.callsign}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest">{DIFFICULTY_LEVELS[memberDifficulty]?.label || 'Cadet'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {memberMissions.map(mission => {
                                                const val = memberDayLog.missions?.[mission.id];
                                                const isComplete = mission.type === 'boolean'
                                                    ? val?.value
                                                    : (() => {
                                                        const safeVal = safePartialValue(val?.value, mission);
                                                        return safeVal.achieved >= safeVal.target && safeVal.target > 0;
                                                    })();

                                                return (
                                                    <div
                                                        key={`${member.id}_${mission.id}`}
                                                        onClick={() => {
                                                            if (mission.type === 'boolean') handleQuickToggle(member.id, memberMissions, mission.id);
                                                        }}
                                                        className={`group relative overflow-hidden p-[1px] rounded-xl transition-all duration-300 ${isComplete ? 'bg-gradient-to-r from-primary/40 via-accent-purple/40 to-primary/40 neon-border-blue' : 'bg-gradient-to-r from-white/10 via-white/5 to-white/10 hover:from-primary/30 hover:to-accent-blue/30'}`}
                                                    >
                                                        <div className={`relative flex items-center gap-4 p-4 rounded-xl bg-[#131b21] h-full ${mission.type === 'boolean' ? 'cursor-pointer' : ''}`}>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (mission.type === 'boolean') handleQuickToggle(member.id, memberMissions, mission.id);
                                                                }}
                                                                className={`size-6 rounded-md border-2 flex items-center justify-center transition-all ${isComplete ? 'bg-primary border-primary' : 'border-slate-600'} ${mission.type === 'boolean' ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
                                                            >
                                                                {isComplete && <IconCheck size={16} stroke="white" />}
                                                            </button>

                                                            <div className="flex-grow">
                                                                <div className={`font-bold text-base transition-colors ${isComplete ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                                                    {mission.name}
                                                                </div>
                                                                <div className="text-xs text-slate-400">{mission.description}</div>

                                                                {mission.type === 'partial' && (
                                                                    <div
                                                                        className="mt-3 flex items-center gap-3"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                                                            <span>Progress</span>
                                                                            <span className="font-mono">{(() => {
                                                                                const safeVal = safePartialValue(val?.value, mission);
                                                                                return `${safeVal.achieved} / ${safeVal.target} ${mission.unit || ''}`;
                                                                            })()}</span>
                                                                        </div>
                                                                        <input
                                                                            type="number"
                                                                            className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center text-white font-mono text-sm focus:outline-none focus:border-primary"
                                                                            value={(() => {
                                                                                const safeVal = safePartialValue(val?.value, mission);
                                                                                return safeVal.achieved;
                                                                            })()}
                                                                            onChange={(e) => handleQuickPartialChange(member.id, memberMissions, mission.id, 'achieved', e.target.value)}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-col items-end gap-1">
                                                                <div className="text-accent-gold font-bold text-sm bg-accent-gold/10 px-2 py-0.5 rounded border border-accent-gold/20 flex items-center gap-1">
                                                                    {(() => {
                                                                        const safeVal = safePartialValue(val?.value, mission);
                                                                        return mission.type === 'boolean'
                                                                            ? Math.round((mission.baseXP || 0) * memberMultiplier)
                                                                            : calculateMissionXP(mission, safeVal, memberDifficulty);
                                                                    })()} XP
                                                                </div>
                                                                {isComplete && <span className="text-[10px] text-green-400 font-mono">COMPLETED</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="w-full mt-6" />

                    </section>
                </div>

                {/* Sidebar Column - Stats */}
                <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
                    {/* Daily Fuel */}
                    <section className="glass-panel rounded-[1.5rem] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Daily Fuel</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-gradient-to-br from-accent-gold/20 to-transparent border border-accent-gold/20 p-4 text-center">
                                <div className="text-[10px] uppercase tracking-widest text-accent-gold/80 font-bold">Perfect Streak</div>
                                <div className="text-3xl font-bold text-white mt-1">{getPerfectStreak(activeUser.id)}</div>
                                <div className="text-xs text-slate-400">Days</div>
                            </div>
                            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 p-4 text-center">
                                <div className="text-[10px] uppercase tracking-widest text-primary/80 font-bold">Total Stars</div>
                                <div className="text-3xl font-bold text-white mt-1">{getTeamTotalStars()}</div>
                                <div className="text-xs text-slate-400">Collected</div>
                            </div>
                        </div>
                    </section>

                    {/* Family Fleet Status */}
                    <section className="glass-panel rounded-[1.5rem] p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                <Users size={16} className="text-accent-purple" />
                                Family Fleet Status
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {crew.map((member, idx) => {
                                const colors = ['bg-accent-purple', 'bg-primary', 'bg-accent-gold'];
                                const color = colors[idx % colors.length];
                                const isUser = member.id === activeUser.id;
                                const eff = 0; // Placeholder efficiency calculation
                                const rank = getRank(getTotalStars(member.id));

                                return (
                                    <div key={member.id} className={`group bg-surface-dark/50 border border-white/5 rounded-xl p-4 hover:border-white/20 transition-all hover:bg-surface-dark/80 relative overflow-hidden ${isUser ? 'border-primary/30' : ''}`}>
                                        <div className={`absolute inset-y-0 left-0 w-1 ${color}`}></div>
                                        <div className="flex items-start gap-3">
                                            <div className="relative">
                                                <div className={`size-10 rounded-full ${color}/20 text-white flex items-center justify-center font-bold text-sm border ${color}/30`}>
                                                    {member.callsign.substring(0, 2).toUpperCase()}
                                                </div>
                                                {isUser && (
                                                    <div className="absolute -bottom-1 -right-1 size-4 rounded-full bg-surface-dark flex items-center justify-center border border-white/10">
                                                        <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="text-white font-bold text-sm">{member.callsign}</h4>
                                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${color}/10 border ${color}/20 text-white uppercase`}>
                                                        {rank.name.substring(0, 3)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                                                    <span>{rank.name}</span>
                                                    <span className="text-slate-300 font-bold">{eff}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* XP Accumulated */}
                    <section className="glass-panel rounded-[1.5rem] p-6 bg-gradient-to-br from-primary/10 to-transparent">
                        <div className="text-center">
                            <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Today's XP (Active Pilot)</h3>
                            <div className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2 glow-text">
                                {dailyProgress.earned}
                                <span className="text-xl text-accent-gold">★</span>
                            </div>
                            <div className="w-full bg-surface-dark rounded-full h-2 mb-2 overflow-hidden border border-white/5">
                                <div
                                    className="bg-gradient-to-r from-primary to-accent-purple h-full rounded-full shadow-glow-primary transition-all duration-1000"
                                    style={{ width: `${dailyProgress.percent}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-slate-400">Keep it up, {activeUser.callsign}!</p>
                        </div>
                        <button
                            onClick={() => onNavigate('settings')}
                            className="w-full mt-4 py-3 bg-white/5 hover:bg-primary hover:text-white text-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-white/5 hover:border-primary hover:shadow-glow-primary"
                        >
                            <Rocket size={18} />
                            Mission Config
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}
