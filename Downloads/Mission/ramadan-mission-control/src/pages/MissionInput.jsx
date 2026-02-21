import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/GlassCard';
import { getMissionIcon, IconCheck } from '../components/icons/MissionIcons'; // New icons
import { MISSIONS, getRamadanDay, calculateMissionXP, DIFFICULTY_LEVELS } from '../utils/missions';

export default function MissionInput() {
    const { activeUser, settings, saveDayLog, getUserLog, allMissions } = useApp();
    const today = new Date().toISOString().split('T')[0];
    const ramadanDay = getRamadanDay(today);

    const [selectedDay, setSelectedDay] = useState(ramadanDay);
    const userLog = getUserLog(activeUser?.id);
    const dayLog = userLog[selectedDay] || {};

    // Initialize mission values
    const [missionValues, setMissionValues] = useState(() => {
        const vals = {};
        allMissions.forEach(m => {
            if (dayLog.missions?.[m.id]) {
                vals[m.id] = dayLog.missions[m.id].value;
            } else {
                vals[m.id] = m.type === 'boolean' ? false : { target: m.defaultTarget || 20, achieved: 0 };
            }
        });
        return vals;
    });

    const [saved, setSaved] = useState(false);

    // Reload values when day changes
    const handleDayChange = (day) => {
        setSelectedDay(day);
        setSaved(false);
        const log = userLog[day] || {};
        const vals = {};
        allMissions.forEach(m => {
            if (log.missions?.[m.id]) {
                vals[m.id] = log.missions[m.id].value;
            } else {
                vals[m.id] = m.type === 'boolean' ? false : { target: m.defaultTarget || 20, achieved: 0 };
            }
        });
        setMissionValues(vals);
    };

    const enabledMissions = useMemo(() => {
        if (!settings.enabledMissions) return allMissions;
        return allMissions.filter(m => settings.enabledMissions.includes(m.id));
    }, [settings.enabledMissions, allMissions]);

    const difficulty = activeUser?.difficulty || 'cadet';
    const multiplier = DIFFICULTY_LEVELS[difficulty]?.multiplier || 1;

    // Calculate total XP
    const totalXP = useMemo(() => {
        let xp = 0;
        enabledMissions.forEach(m => {
            xp += calculateMissionXP(m, missionValues[m.id], difficulty);
        });
        return xp;
    }, [missionValues, enabledMissions, difficulty]);

    const maxPossibleXP = useMemo(() => {
        let xp = 0;
        enabledMissions.forEach(m => {
            xp += Math.round(m.baseXP * multiplier);
        });
        return xp;
    }, [enabledMissions, multiplier]);

    const handleToggle = (missionId) => {
        setMissionValues(prev => ({ ...prev, [missionId]: !prev[missionId] }));
        setSaved(false);
    };

    const handlePartialChange = (missionId, field, value) => {
        setMissionValues(prev => ({
            ...prev,
            [missionId]: { ...prev[missionId], [field]: Math.max(0, parseInt(value) || 0) },
        }));
        setSaved(false);
    };

    const handleSave = () => {
        saveDayLog(activeUser.id, selectedDay, missionValues);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (!activeUser) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-2">
                    <p className="text-slate-400 text-lg">No active crew member</p>
                    <p className="text-slate-500 text-sm">Create a crew member in onboarding to start logging missions.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-wide">
                        Mission Input Center
                    </h1>
                    <p className="flex items-center gap-2 text-sm text-neon-cyan mt-1 font-medium">
                        <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
                        Log Current Flight Telemetry
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-space-800 p-2 rounded-xl border border-space-700">
                    <button
                        onClick={() => handleDayChange(Math.max(1, selectedDay - 1))}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
                    >
                        ←
                    </button>
                    <div className="text-center min-w-[100px]">
                        <div className="text-[10px] uppercase tracking-widest text-gray-500">Mission Day</div>
                        <div className="font-display font-bold text-white">Ramadan {selectedDay}</div>
                    </div>
                    <button
                        onClick={() => handleDayChange(Math.min(30, selectedDay + 1))}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Main List */}
            <div className="space-y-4">
                {enabledMissions.map(mission => {
                    const val = missionValues[mission.id];
                    const xp = calculateMissionXP(mission, val, difficulty);
                    const displayXP = mission.type === 'boolean'
                        ? Math.round((mission.baseXP || 0) * multiplier)
                        : xp;
                    const isComplete = mission.type === 'boolean' ? val : (val?.achieved >= val?.target && val?.target > 0);
                    const Icon = getMissionIcon(mission.id, mission.icon);

                    return (
                        <div
                            key={mission.id}
                            onClick={() => mission.type === 'boolean' && handleToggle(mission.id)}
                            className={`relative overflow-hidden transition-all duration-300 rounded-2xl border ${isComplete
                                    ? 'bg-space-800/80 border-neon-cyan/30 shadow-[0_0_20px_rgba(79,209,197,0.1)]'
                                    : 'bg-space-800/40 border-space-700 hover:border-space-600'
                                } ${mission.type === 'boolean' ? 'cursor-pointer' : ''}`}
                        >
                            {/* Progress Bar Background for Completed */}
                            {isComplete && (
                                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-transparent pointer-events-none" />
                            )}

                            <div className="p-4 sm:p-6 flex items-start gap-4 sm:gap-6 relative z-10">
                                {/* Checkbox / Toggle Area */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        mission.type === 'boolean' && handleToggle(mission.id);
                                    }}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 ${isComplete
                                            ? 'bg-gradient-to-br from-neon-blue to-neon-purple shadow-lg scale-105'
                                            : 'bg-space-900 border-2 border-space-600 hover:border-gray-500'
                                        }`}
                                >
                                    {isComplete ? <IconCheck stroke="white" /> : <div className="opacity-50 grayscale">{Icon}</div>}
                                </button>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-1">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                        <div>
                                            <h3 className={`text-lg font-bold ${isComplete ? 'text-white' : 'text-gray-300'}`}>
                                                {mission.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 font-medium">{mission.description}</p>
                                        </div>

                                        {/* XP Badge */}
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isComplete
                                                ? 'bg-neon-gold/10 border-neon-gold/30 text-neon-gold'
                                                : 'bg-space-900 border-space-700 text-gray-500'
                                            }`}>
                                            <span className="text-xs font-display font-bold">+{displayXP} XP</span>
                                            {isComplete && <span className="text-[10px] uppercase tracking-wider font-bold">★</span>}
                                        </div>
                                    </div>

                                    {/* Partial Input / Progress */}
                                    {mission.type === 'partial' && (
                                        <div className="mt-4 bg-space-900/50 rounded-xl p-3 border border-space-700/50">
                                            <div className="flex items-center justify-between text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">
                                                <span>Progress</span>
                                                <span>{val?.achieved || 0} / {val?.target || 0} {mission.unit}</span>
                                            </div>

                                            {/* Custom Slider/Input */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 h-3 bg-space-900 rounded-full overflow-hidden relative">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-500"
                                                        style={{ width: `${Math.min((val?.achieved / (val?.target || 1)) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        className="w-16 bg-space-800 border border-space-600 rounded-lg px-2 py-1 text-center text-white font-mono text-sm focus:border-neon-blue outline-none"
                                                        value={val?.achieved || 0}
                                                        onChange={(e) => handlePartialChange(mission.id, 'achieved', e.target.value)}
                                                    />
                                                    <span className="text-sm text-gray-600">/ {val?.target}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Save Button (Fixed Bottom) */}
            <div className="fixed bottom-6 right-6 left-6 md:left-72 z-40">
                <button
                    onClick={handleSave}
                    className={`w-full max-w-4xl mx-auto py-4 rounded-2xl font-display font-bold text-sm uppercase tracking-widest shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 ${saved
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white translate-y-2'
                            : 'bg-gradient-to-r from-space-700 to-space-800 text-gray-300 border border-space-600 hover:text-white hover:border-gray-500 hover:-translate-y-1'
                        }`}
                >
                    {saved ? (
                        <><span>✓</span> DAILY LOG SECURED</>
                    ) : (
                        <><span>💾</span> SUBMIT DAILY LOG (DAY {selectedDay})</>
                    )}
                </button>
            </div>

            {/* Bottom Spacer for fixed button */}
            <div className="h-20" />
        </div>
    );
}
