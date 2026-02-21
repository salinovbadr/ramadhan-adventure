import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Shield, Sun } from 'lucide-react';
import { getRamadanDay, calculateMissionXP, PHASES } from '../utils/missions';

export default function Analysis() {
    const { activeUser, crew, allMissions, settings, getMissionLog } = useApp();
    const currentDay = getRamadanDay(new Date().toISOString().split('T')[0]);

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

    const enabledMissions = useMemo(() => {
        if (!settings.enabledMissions) return allMissions;
        return allMissions.filter(m => settings.enabledMissions.includes(m.id));
    }, [settings.enabledMissions, allMissions]);

    // Calculate stats for all phases
    const phaseStats = useMemo(() => {
        return PHASES.map(phase => {
            const [startDay, endDay] = phase.days;

            // Calculate stats per member for this phase's days
            const memberStats = {};
            crew.forEach(member => {
                let totalXP = 0;
                let maxXP = 0;
                for (let day = startDay; day <= endDay; day++) {
                    const userLog = getMissionLog(member.id);
                    const dayLog = userLog?.[day] || {};
                    const missionsObj = dayLog.missions || {};

                    enabledMissions
                        .filter(mission => isMissionApplicableToMember(mission, member.id) && isMissionActiveOnDay(mission, day))
                        .forEach(mission => {
                            const value = missionsObj?.[mission.id]?.value;
                            if (value !== undefined && value !== null) {
                                totalXP += calculateMissionXP(mission, value, member.difficulty);
                            }
                            const perCrew = mission.perCrew?.[member.id];
                            const defaultTarget = perCrew?.defaultTarget ?? mission.defaultTarget;
                            maxXP += calculateMissionXP(
                                mission,
                                mission.type === 'boolean'
                                    ? true
                                    : { achieved: defaultTarget || 1, target: defaultTarget || 1 },
                                member.difficulty
                            );
                        });
                }
                memberStats[member.id] = { totalXP, maxXP };
            });

            let totalXP = 0, maxXP = 0;
            Object.values(memberStats).forEach(s => { totalXP += s.totalXP; maxXP += s.maxXP || 1; });
            const percent = maxXP > 0 ? Math.round((totalXP / maxXP) * 100) : 0;

            return {
                ...phase,
                startDay,
                endDay,
                stats: { memberStats },
                percent,
                isActive: currentDay >= startDay && currentDay <= endDay
            };
        });
    }, [crew, enabledMissions, getMissionLog, currentDay]);

    const getPhaseIcon = (id) => {
        switch (id) {
            case 1: return <Sun size={24} />;
            case 2: return <Moon size={24} />;
            case 3: return <Shield size={24} />;
            default: return <Moon size={24} />;
        }
    };

    const getPhaseColor = (id) => {
        switch (id) {
            case 1: return 'text-accent-purple';
            case 2: return 'text-primary';
            case 3: return 'text-accent-gold';
            default: return 'text-white';
        }
    };

    const getPhaseGlow = (id) => {
        switch (id) {
            case 1: return 'planet-glow-purple from-purple-500 via-fuchsia-600 to-indigo-900';
            case 2: return 'planet-glow-blue from-cyan-400 via-blue-500 to-blue-900';
            case 3: return 'planet-glow-gold from-amber-300 via-orange-500 to-yellow-900';
            default: return '';
        }
    };

    return (
        <div className="flex flex-col h-full gap-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase">System Analytics</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">3-Phase Mission Report</h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-lg">Detailed telemetry on family performance across the three stages of Ramadan.</p>
                </div>
            </div>

            {/* 3 Column Phase Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
                {phaseStats.map((phase) => {
                    const isFuture = currentDay < phase.startDay;
                    const colorClass = getPhaseColor(phase.id);
                    const glowClass = getPhaseGlow(phase.id);

                    const phaseTotalXP = crew.reduce((sum, m) => sum + (phase.stats.memberStats[m.id]?.totalXP || 0), 0);

                    return (
                        <section
                            key={phase.id}
                            className={`glass-panel rounded-[2rem] p-1 flex flex-col h-full relative group transition-colors duration-500 hover:border-white/20 ${phase.isActive ? 'ring-1 ring-primary/50' : ''} ${isFuture ? 'opacity-60 grayscale' : ''}`}
                        >
                            {phase.isActive && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-background-dark text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase border border-primary/50 shadow-glow-primary z-10">
                                    Current Phase
                                </div>
                            )}

                            {/* Card Header */}
                            <div className="p-6 pb-2 border-b border-white/5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className={`${colorClass} text-xs font-bold tracking-[0.2em] uppercase mb-1 block`}>Phase 0{phase.id}</span>
                                        <h2 className="text-2xl font-bold text-white">{phase.name}</h2>
                                        <p className="text-slate-400 text-sm">Days {phase.startDay} - {phase.endDay}</p>
                                    </div>
                                    <div className={`flex items-center justify-center size-10 rounded-full bg-white/5 ${colorClass}`}>
                                        {getPhaseIcon(phase.id)}
                                    </div>
                                </div>
                            </div>

                            {/* Planet Visualization */}
                            <div className="relative py-12 flex justify-center items-center">
                                {/* SVG Progress Ring */}
                                <div className="relative size-48">
                                    <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                                        <circle className="text-white/5 stroke-current" cx="50" cy="50" fill="none" r="44" strokeWidth="6" />
                                        <circle
                                            className={`${colorClass} stroke-current transition-all duration-1000`}
                                            cx="50" cy="50" fill="none" r="44" strokeWidth="6"
                                            strokeDasharray="276"
                                            strokeDashoffset={276 - (276 * phase.percent) / 100}
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                    {/* Planet Orb */}
                                    <div className={`absolute inset-0 m-auto size-32 rounded-full overflow-hidden bg-black ${glowClass}`}>
                                        <div className={`w-full h-full bg-gradient-to-br rounded-full opacity-90 ${glowClass.split(' ').slice(1).join(' ')}`}></div>
                                        {/* Texture Overlay (using CSS pattern if image fails) */}
                                        <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                                    </div>

                                    {/* Percentage Badge */}
                                    <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 bg-surface-dark border border-white/10 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1 whitespace-nowrap`}>
                                        <span className={colorClass}>{phase.percent}%</span> {phase.percent >= 100 ? 'Complete' : 'Progress'}
                                    </div>
                                </div>
                            </div>

                            {/* Metrics / Bar Chart */}
                            <div className="bg-background-dark/50 flex-grow rounded-[1.5rem] mx-2 mb-2 p-6 flex flex-col gap-8">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-slate-300">Family Contribution</h3>
                                    </div>

                                    {(() => {
                                        const ranked = crew
                                            .map(member => ({
                                                member,
                                                totalXP: phase.stats.memberStats[member.id]?.totalXP || 0,
                                            }))
                                            .sort((a, b) => b.totalXP - a.totalXP);
                                        const topId = ranked[0]?.member?.id;

                                        return (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                {crew.map((member) => {
                                                    const mStats = phase.stats.memberStats[member.id] || { totalXP: 0, maxXP: 100 };
                                                    const sharePercent = phaseTotalXP > 0 ? Math.round((mStats.totalXP / phaseTotalXP) * 100) : 0;
                                                    const ring = 276;
                                                    const dashOffset = ring - (ring * Math.min(sharePercent, 100)) / 100;
                                                    const isTop = member.id === topId && phaseTotalXP > 0;
                                                    const isActiveUser = member.id === activeUser.id;

                                                    return (
                                                        <div
                                                            key={member.id}
                                                            className={`relative rounded-2xl border p-4 transition-all ${isTop ? 'border-primary/40 bg-primary/10 shadow-glow-primary' : 'border-white/10 bg-white/5'} ${isActiveUser ? 'ring-1 ring-white/10' : ''}`}
                                                        >
                                                            {isTop && (
                                                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-primary text-background-dark border border-primary/50">
                                                                    Top
                                                                </div>
                                                            )}

                                                            <div className="flex items-center gap-3">
                                                                <div className="relative size-12">
                                                                    <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                                                                        <circle className="text-white/10 stroke-current" cx="50" cy="50" fill="none" r="44" strokeWidth="10" />
                                                                        <circle
                                                                            className={`${colorClass} stroke-current transition-all duration-1000`}
                                                                            cx="50" cy="50" fill="none" r="44" strokeWidth="10"
                                                                            strokeDasharray={ring}
                                                                            strokeDashoffset={dashOffset}
                                                                            strokeLinecap="round"
                                                                        />
                                                                    </svg>
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <div className={`text-sm font-black font-mono ${isTop ? 'text-white' : 'text-slate-200'}`}>{sharePercent}%</div>
                                                                    </div>
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <div className="text-sm font-bold text-white truncate">{member.callsign}</div>
                                                                    <div className="text-[11px] text-slate-400 font-mono">{mStats.totalXP} XP</div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-1000 ${isTop ? 'bg-primary' : 'bg-white/30'}`}
                                                                    style={{ width: `${Math.min(sharePercent, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                        </section>
                    );
                })}
            </div>
        </div>
    );
}
