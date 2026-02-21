import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Users, Rocket, Bell, Sliders, Trash2, PlusCircle, Check, X, Star, Download, Upload, Cloud, CloudOff } from 'lucide-react';
import { AVATARS, DIFFICULTY_LEVELS } from '../utils/missions';
import { isFirebaseReady } from '../utils/firebase';
import { syncFromFirebase, syncToFirebase } from '../utils/storage';

export default function Settings() {
    const {
        activeUser,
        setActiveUser,
        crew,
        addMember,
        updateMember,
        removeMember,
        settings,
        updateAppSettings,
        customMissions,
        addCustomMission,
        updateCustomMission,
        removeCustomMission,
        allMissions,
        updateDefaultMission,
        clearDefaultMissionOverride,
        resetAllData,
        initialized,
    } = useApp();

    // Don't render until context is initialized
    if (!initialized) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-slate-400">Loading...</div>
            </div>
        );
    }

    const [activeTab, setActiveTab] = useState('profile');
    const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'success' | 'error'
    const [newMemberName, setNewMemberName] = useState('');

    // Custom Mission Form State
    const [showMissionForm, setShowMissionForm] = useState(false);
    const [editingMissionId, setEditingMissionId] = useState(null);
    const [newMission, setNewMission] = useState({
        name: '',
        description: '',
        type: 'boolean', // boolean, partial
        baseXP: 50,
        icon: 'star',
        target: 1, // for partial
        unit: 'times',
        assignedTo: null,
        activeDays: null
    });

    const resetMissionForm = () => {
        setEditingMissionId(null);
        setNewMission({
            name: '',
            description: '',
            type: 'boolean',
            baseXP: 50,
            icon: 'star',
            target: 1,
            unit: 'times',
            assignedTo: null,
            activeDays: null
        });
    };

    const handleAddCrew = (e) => {
        e.preventDefault();
        if (newMemberName.trim()) {
            addMember(newMemberName.trim());
            setNewMemberName('');
        }
    };

    const handleAddCustomMission = () => {
        if (!newMission.name) return;

        const normalizedAssignedTo = Array.isArray(newMission.assignedTo) && newMission.assignedTo.length === 0
            ? null
            : newMission.assignedTo;

        if (editingMissionId) {
            updateCustomMission(editingMissionId, {
                ...newMission,
                assignedTo: normalizedAssignedTo,
            });
        } else {
            const missionToAdd = {
                id: `custom_${Date.now()}`,
                ...newMission,
                category: 'custom'
            };
            missionToAdd.assignedTo = normalizedAssignedTo;
            addCustomMission(missionToAdd);
        }

        setShowMissionForm(false);
        resetMissionForm();
    };

    const startEditMission = (mission) => {
        setEditingMissionId(mission.id);
        setShowMissionForm(true);
        setNewMission({
            name: mission.name || '',
            description: mission.description || '',
            type: mission.type || 'boolean',
            baseXP: mission.baseXP ?? 50,
            icon: mission.icon || 'star',
            target: mission.target ?? 1,
            unit: mission.unit || 'times',
            assignedTo: mission.assignedTo ?? null,
            activeDays: mission.activeDays ?? null
        });
    };

    const toggleDay = (activeDays, day) => {
        const current = Array.isArray(activeDays) ? activeDays : [];
        if (current.includes(day)) return current.filter(d => d !== day);
        return [...current, day].sort((a, b) => a - b);
    };

    const renderDayChips = (activeDays, onChange) => {
        const current = Array.isArray(activeDays) ? activeDays : null;
        return (
            <div className="mt-2 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${current === null ? 'bg-primary/20 text-white border-primary/30' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}
                >
                    Every Day
                </button>
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                    const selected = Array.isArray(current) && current.includes(day);
                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => onChange(toggleDay(current, day))}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors border ${selected ? 'bg-primary/20 text-white border-primary/30' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        );
    };

    const normalizeAssignedTo = (assignedTo) => {
        if (Array.isArray(assignedTo) && assignedTo.length === 0) return null;
        return assignedTo;
    };

    const handleResetAll = () => {
        const ok1 = window.confirm('This will delete ALL crew, logs, settings, and custom missions. Continue?');
        if (!ok1) return;
        const ok2 = window.confirm('Final confirmation: reset everything? This cannot be undone.');
        if (!ok2) return;
        resetAllData();
    };

    return (
        <div className="flex flex-col h-full gap-8">

            {/* Header */}
            <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white uppercase glow-text">Mission Configuration</h1>
                <p className="text-slate-400 text-lg">Calibrate mission objectives and crew parameters.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
                {/* Sidebar Nav */}
                <div className="col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${activeTab === 'profile' ? 'bg-primary/20 border border-primary/30 text-white shadow-glow-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <User size={20} className={activeTab === 'profile' ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
                        <span className="font-medium tracking-wide">Crew Profile</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('crew')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${activeTab === 'crew' ? 'bg-primary/20 border border-primary/30 text-white shadow-glow-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Users size={20} className={activeTab === 'crew' ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
                        <span className="font-medium tracking-wide">Manage Fleet</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('missions')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${activeTab === 'missions' ? 'bg-primary/20 border border-primary/30 text-white shadow-glow-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Rocket size={20} className={activeTab === 'missions' ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
                        <span className="font-medium tracking-wide">Mission Config</span>
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (window.confirm('Delete all crew, logs, settings, and custom missions? This cannot be undone.')) {
                                    resetAllData();
                                }
                            }}
                            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all duration-300 font-bold tracking-wide"
                            type="button"
                        >
                            <Trash2 size={20} className="group-hover:text-red-300 transition-colors" />
                            <span className="font-medium tracking-wide">Reset All Data</span>
                        </button>
                        {isFirebaseReady() && (
                            <button
                                onClick={async () => {
                                    setSyncStatus('syncing');
                                    try {
                                        await syncFromFirebase();
                                        await syncToFirebase();
                                        setSyncStatus('success');
                                        setTimeout(() => setSyncStatus('idle'), 2000);
                                    } catch (e) {
                                        setSyncStatus('error');
                                        setTimeout(() => setSyncStatus('idle'), 3000);
                                    }
                                }}
                                disabled={syncStatus !== 'idle'}
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all duration-300 font-bold tracking-wide ${
                                    syncStatus === 'syncing'
                                        ? 'bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed'
                                        : syncStatus === 'success'
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                        : syncStatus === 'error'
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                        : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:text-primary'
                                }`}
                                type="button"
                            >
                                {syncStatus === 'syncing' && <Cloud size={20} className="animate-pulse" />}
                                {syncStatus === 'success' && <Cloud size={20} />}
                                {syncStatus === 'error' && <CloudOff size={20} />}
                                {syncStatus === 'idle' && <Cloud size={20} />}
                                <span className="font-medium tracking-wide">
                                    {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'success' ? 'Synced' : syncStatus === 'error' ? 'Sync Failed' : 'Sync Now'}
                                </span>
                            </button>
                        )}
                    </div>
                </div>
                {/* Main Content Area */}
                <div className="col-span-1 lg:col-span-3 space-y-8">


                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && activeUser && (
                        <div className="space-y-6 animate-fade-in">
                            <section className="glass-panel p-6 rounded-2xl md:p-8">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">badge</span>
                                    Pilot Identification
                                </h3>

                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    {/* Avatar Selection */}
                                    <div className="flex-shrink-0 text-center space-y-4">
                                        <div className="size-32 rounded-full border-4 border-slate-700 mx-auto flex items-center justify-center text-6xl shadow-xl transition-all duration-300" style={{ backgroundColor: AVATARS.find(a => a.id === activeUser.avatar)?.bg }}>
                                            {AVATARS.find(a => a.id === activeUser.avatar)?.emoji}
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {(AVATARS || []).filter(avatar => avatar && avatar.id).map(avatar => (
                                                <button
                                                    key={avatar.id}
                                                    onClick={() => updateMember(activeUser.id, { avatar: avatar.id })}
                                                    className={`size-10 rounded-full flex items-center justify-center text-xl transition-transform hover:scale-110 ${activeUser.avatar === avatar.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-dark' : 'opacity-70 hover:opacity-100'}`}
                                                    style={{ backgroundColor: avatar.bg }}
                                                >
                                                    {avatar.emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Details Form */}
                                    <div className="flex-grow space-y-6 w-full">
                                        <div>
                                            <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2">Callsign (Name)</label>
                                            <input
                                                type="text"
                                                value={activeUser.callsign}
                                                onChange={(e) => updateMember(activeUser.id, { callsign: e.target.value })}
                                                className="input-field text-xl font-bold"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2">Rank Difficulty</label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {Object.entries(DIFFICULTY_LEVELS || {}).map(([key, level]) => (
                                                    <label
                                                        key={key}
                                                        className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${activeUser.difficulty === key ? 'bg-primary/10 border-primary shadow-glow-primary' : 'bg-surface-dark border-slate-700 hover:border-slate-500'}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="difficulty"
                                                            className="sr-only"
                                                            checked={activeUser.difficulty === key}
                                                            onChange={() => updateMember(activeUser.id, { difficulty: key })}
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className={`font-bold text-sm ${activeUser.difficulty === key ? 'text-white' : 'text-slate-300'}`}>{level.label}</span>
                                                                <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 rounded">{level.multiplier}x</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* CREW TAB */}
                    {activeTab === 'crew' && (
                        <div className="space-y-6 animate-fade-in">
                            <section className="glass-panel p-6 rounded-2xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Users className="text-primary" />
                                        Current Roster
                                    </h3>
                                    <form onSubmit={handleAddCrew} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMemberName}
                                            onChange={(e) => setNewMemberName(e.target.value)}
                                            placeholder="New recruit name..."
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary w-48"
                                        />
                                        <button type="submit" className="bg-primary hover:bg-primary-dark text-white p-2 rounded-lg transition-colors">
                                            <PlusCircle size={18} />
                                        </button>
                                    </form>
                                </div>

                                <div className="grid gap-4">
                                    {(crew || []).filter(member => member && member.id).map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 group hover:border-slate-500/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-full flex items-center justify-center text-xl bg-slate-700" style={{ backgroundColor: AVATARS.find(a => a.id === member.avatar)?.bg }}>
                                                    {AVATARS.find(a => a.id === member.avatar)?.emoji}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{member.callsign}</p>
                                                    <p className="text-xs text-slate-400 capitalize">{member.difficulty} Rank</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setActiveUser(member.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${activeUser?.id === member.id ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                                                >
                                                    {activeUser?.id === member.id ? 'Active Pilot' : 'Switch To'}
                                                </button>
                                                {(crew || []).length > 1 && (
                                                    <button
                                                        onClick={() => { if (window.confirm('Delete this crew member?')) removeMember(member.id) }}
                                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* MISSIONS TAB */}
                    {activeTab === 'missions' && (
                        <div className="space-y-6 animate-fade-in">
                            <section className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Default Missions</h3>
                                        <p className="text-sm text-slate-400">Edit built-in missions (XP rules, type, targets) and changes will apply everywhere.</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {(allMissions || [])
                                        .filter(m => m && m.id && !String(m.id).startsWith('custom_'))
                                        .map(mission => (
                                            <div key={mission.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-primary/30 transition-all">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                                        <div className="size-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                                                            <Star size={20} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                                <div className="md:col-span-4">
                                                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest">Name</label>
                                                                    <input
                                                                        className="input-field mt-1"
                                                                        value={mission.name}
                                                                        onChange={(e) => updateDefaultMission(mission.id, { name: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-4">
                                                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest">Description</label>
                                                                    <input
                                                                        className="input-field mt-1"
                                                                        value={mission.description || ''}
                                                                        onChange={(e) => updateDefaultMission(mission.id, { description: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest">Type</label>
                                                                    <select
                                                                        className="input-field mt-1 appearance-none"
                                                                        value={mission.type}
                                                                        onChange={(e) => updateDefaultMission(mission.id, { type: e.target.value })}
                                                                    >
                                                                        <option value="boolean">boolean</option>
                                                                        <option value="partial">partial</option>
                                                                    </select>
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest">Base XP</label>
                                                                    <input
                                                                        type="number"
                                                                        className="input-field mt-1"
                                                                        value={mission.baseXP}
                                                                        onChange={(e) => updateDefaultMission(mission.id, { baseXP: parseInt(e.target.value) || 0 })}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {mission.type === 'partial' && (
                                                                <div className="mt-3 space-y-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                                        <div className="md:col-span-3">
                                                                            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Default Target</label>
                                                                            <input
                                                                                type="number"
                                                                                className="input-field mt-1"
                                                                                value={mission.defaultTarget ?? 20}
                                                                                onChange={(e) => updateDefaultMission(mission.id, { defaultTarget: parseInt(e.target.value) || 0 })}
                                                                            />
                                                                        </div>
                                                                        <div className="md:col-span-3">
                                                                            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Unit</label>
                                                                            <input
                                                                                className="input-field mt-1"
                                                                                value={mission.unit || ''}
                                                                                onChange={(e) => updateDefaultMission(mission.id, { unit: e.target.value })}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <label className="text-[10px] text-slate-500 uppercase tracking-widest">Per-Crew Target/Unit</label>
                                                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                            {(crew || []).filter(member => member && member.id).map(member => {
                                                                                const isApplicable = mission.assignedTo === null || mission.assignedTo === undefined || (Array.isArray(mission.assignedTo) && mission.assignedTo.includes(member.id));
                                                                                const per = mission.perCrew?.[member.id] || {};

                                                                                return (
                                                                                    <div key={member.id} className={`rounded-xl border p-3 ${isApplicable ? 'border-white/10 bg-white/5' : 'border-white/5 bg-white/2 opacity-50'}`}>
                                                                                        <div className="text-xs font-bold text-slate-200 mb-2">{member.callsign}</div>
                                                                                        <div className="grid grid-cols-2 gap-2">
                                                                                            <div>
                                                                                                <label className="text-[10px] text-slate-500 uppercase tracking-widest">Target</label>
                                                                                                <input
                                                                                                    type="number"
                                                                                                    className="input-field mt-1"
                                                                                                    value={per.defaultTarget ?? ''}
                                                                                                    disabled={!isApplicable}
                                                                                                    placeholder={String(mission.defaultTarget ?? 20)}
                                                                                                    onChange={(e) => {
                                                                                                        const current = mission.perCrew || {};
                                                                                                        const nextPer = {
                                                                                                            ...current,
                                                                                                            [member.id]: {
                                                                                                                ...(current[member.id] || {}),
                                                                                                                defaultTarget: parseInt(e.target.value) || 0,
                                                                                                            },
                                                                                                        };
                                                                                                        updateDefaultMission(mission.id, { perCrew: nextPer });
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                            <div>
                                                                                                <label className="text-[10px] text-slate-500 uppercase tracking-widest">Unit</label>
                                                                                                <input
                                                                                                    className="input-field mt-1"
                                                                                                    value={per.unit ?? ''}
                                                                                                    disabled={!isApplicable}
                                                                                                    placeholder={mission.unit || ''}
                                                                                                    onChange={(e) => {
                                                                                                        const current = mission.perCrew || {};
                                                                                                        const nextPer = {
                                                                                                            ...current,
                                                                                                            [member.id]: {
                                                                                                                ...(current[member.id] || {}),
                                                                                                                unit: e.target.value,
                                                                                                            },
                                                                                                        };
                                                                                                        updateDefaultMission(mission.id, { perCrew: nextPer });
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                        <p className="mt-2 text-[11px] text-slate-500">Leave empty to use the default target/unit above. Fill to override per crew.</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="mt-3">
                                                                <label className="text-[10px] text-slate-500 uppercase tracking-widest">Assign To</label>
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateDefaultMission(mission.id, { assignedTo: null })}
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${mission.assignedTo === null || mission.assignedTo === undefined ? 'bg-primary/20 text-white border-primary/30' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}
                                                                    >
                                                                        All Crew
                                                                    </button>
                                                                    {(crew || []).filter(m => m && m.id).map(m => {
                                                                        const list = Array.isArray(mission.assignedTo) ? mission.assignedTo : [];
                                                                        const selected = list.includes(m.id);
                                                                        return (
                                                                            <button
                                                                                key={m.id}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const current = Array.isArray(mission.assignedTo) ? mission.assignedTo : [];
                                                                                    const next = current.includes(m.id)
                                                                                        ? current.filter(id => id !== m.id)
                                                                                        : [...current, m.id];
                                                                                    updateDefaultMission(mission.id, { assignedTo: normalizeAssignedTo(next) });
                                                                                }}
                                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${selected ? 'bg-primary/20 text-white border-primary/30' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}
                                                                            >
                                                                                {m.callsign}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            <div className="mt-3">
                                                                <label className="text-[10px] text-slate-500 uppercase tracking-widest">Active Days</label>
                                                                {renderDayChips(mission.activeDays ?? null, (next) => updateDefaultMission(mission.id, { activeDays: next }))}
                                                                <p className="mt-2 text-[11px] text-slate-500">Set specific Ramadan days (1–30) for this mission to appear. Choose Every Day to disable scheduling.</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => bumpMissionOrder(mission, 'up', (u) => updateDefaultMission(mission.id, u))}
                                                            className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors text-xs font-bold whitespace-nowrap"
                                                        >
                                                            Up
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => bumpMissionOrder(mission, 'down', (u) => updateDefaultMission(mission.id, u))}
                                                            className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors text-xs font-bold whitespace-nowrap"
                                                        >
                                                            Down
                                                        </button>
                                                        <button
                                                            onClick={() => clearDefaultMissionOverride(mission.id)}
                                                            className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors text-xs font-bold whitespace-nowrap"
                                                            type="button"
                                                        >
                                                            Reset
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </section>

                            <section className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Custom Protocols</h3>
                                        <p className="text-sm text-slate-400">Define additional mission parameters.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowMissionForm(!showMissionForm)}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 transition-all text-sm font-bold"
                                    >
                                        <PlusCircle size={16} />
                                        Add New Protocol
                                    </button>
                                </div>

                                {/* ADD MISSION FORM */}
                                {showMissionForm && (
                                    <div className="mb-8 bg-slate-800/50 p-6 rounded-xl border border-slate-700 animate-slide-down">
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-400 uppercase tracking-widest pl-1">Mission Name</label>
                                                <input
                                                    type="text"
                                                    className="input-field mt-1"
                                                    placeholder="e.g. Read Tafsir"
                                                    value={newMission.name}
                                                    onChange={e => setNewMission({ ...newMission, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-400 uppercase tracking-widest pl-1">Description</label>
                                                <input
                                                    type="text"
                                                    className="input-field mt-1"
                                                    placeholder="Brief detail..."
                                                    value={newMission.description}
                                                    onChange={e => setNewMission({ ...newMission, description: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-400 uppercase tracking-widest pl-1">Base XP</label>
                                                <input
                                                    type="number"
                                                    className="input-field mt-1"
                                                    value={newMission.baseXP}
                                                    onChange={e => setNewMission({ ...newMission, baseXP: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-400 uppercase tracking-widest pl-1">Icon Style</label>
                                                <select
                                                    className="input-field mt-1 appearance-none"
                                                    value={newMission.icon}
                                                    onChange={e => setNewMission({ ...newMission, icon: e.target.value })}
                                                >
                                                    <option value="star">Star</option>
                                                    <option value="book">Book</option>
                                                    <option value="heart">Heart</option>
                                                    <option value="moon">Moon</option>
                                                </select>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-400 uppercase tracking-widest pl-1">Assign To</label>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewMission({ ...newMission, assignedTo: null })}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${newMission.assignedTo === null ? 'bg-primary/20 text-white border-primary/30' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}
                                                    >
                                                        All Crew
                                                    </button>
                                                    {(crew || []).filter(m => m && m.id).map(m => {
                                                        const list = Array.isArray(newMission.assignedTo) ? newMission.assignedTo : [];
                                                        const selected = list.includes(m.id);
                                                        return (
                                                            <button
                                                                key={m.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    const current = Array.isArray(newMission.assignedTo) ? newMission.assignedTo : [];
                                                                    const next = current.includes(m.id)
                                                                        ? current.filter(id => id !== m.id)
                                                                        : [...current, m.id];
                                                                    setNewMission({ ...newMission, assignedTo: next.length === 0 ? null : next });
                                                                }}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${selected ? 'bg-primary/20 text-white border-primary/30' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}
                                                            >
                                                                {m.callsign}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <p className="mt-2 text-[11px] text-slate-500">Choose specific crew to make this mission appear only for them. If none selected, it defaults to All Crew.</p>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-400 uppercase tracking-widest pl-1">Active Days</label>
                                                {renderDayChips(newMission.activeDays ?? null, (next) => setNewMission({ ...newMission, activeDays: next }))}
                                                <p className="mt-2 text-[11px] text-slate-500">Schedule when this protocol appears (Ramadan day 1–30). Every Day means always available.</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => setShowMissionForm(false)}
                                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddCustomMission}
                                                className="btn-primary"
                                            >
                                                <Check size={16} />
                                                {editingMissionId ? 'Save Changes' : 'Initialize Protocol'}
                                            </button>
                                            <button
                                                onClick={() => resetMissionForm()}
                                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
                                                type="button"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* CUSTOM MISSIONS LIST */}
                                <div className="space-y-3">
                                    {(!customMissions || customMissions.length === 0) && (
                                        <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                                            No custom protocols active.
                                        </div>
                                    )}
                                    {(customMissions || []).filter(mission => mission && mission.id).map(mission => (
                                        <div key={mission.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-primary/30 transition-all">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                                    <div className="size-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                                                        <Star size={20} />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                            <div className="md:col-span-4">
                                                                <label className="text-[10px] text-slate-500 uppercase tracking-widest">Name</label>
                                                                <input
                                                                    className="input-field mt-1"
                                                                    value={mission.name}
                                                                    onChange={(e) => updateCustomMission(mission.id, { name: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="md:col-span-4">
                                                                <label className="text-[10px] text-slate-500 uppercase tracking-widest">Description</label>
                                                                <input
                                                                    className="input-field mt-1"
                                                                    value={mission.description || ''}
                                                                    onChange={(e) => updateCustomMission(mission.id, { description: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="text-[10px] text-slate-500 uppercase tracking-widest">Type</label>
                                                                <select
                                                                    className="input-field mt-1 appearance-none"
                                                                    value={mission.type || 'boolean'}
                                                                    onChange={(e) => updateCustomMission(mission.id, { type: e.target.value })}
                                                                >
                                                                    <option value="boolean">boolean</option>
                                                                    <option value="partial">partial</option>
                                                                </select>
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="text-[10px] text-slate-500 uppercase tracking-widest">Base XP</label>
                                                                <input
                                                                    type="number"
                                                                    className="input-field mt-1"
                                                                    value={mission.baseXP ?? 0}
                                                                    onChange={(e) => updateCustomMission(mission.id, { baseXP: parseInt(e.target.value) || 0 })}
                                                                />
                                                            </div>
                                                        </div>

                                                        {mission.type === 'partial' && (
                                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3">
                                                                <div className="md:col-span-3">
                                                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest">Default Target</label>
                                                                    <input
                                                                        type="number"
                                                                        className="input-field mt-1"
                                                                        value={mission.defaultTarget ?? mission.target ?? 20}
                                                                        onChange={(e) => updateCustomMission(mission.id, { defaultTarget: parseInt(e.target.value) || 0 })}
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-3">
                                                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest">Unit</label>
                                                                    <input
                                                                        className="input-field mt-1"
                                                                        value={mission.unit || ''}
                                                                        onChange={(e) => updateCustomMission(mission.id, { unit: e.target.value })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {mission.type === 'partial' && (
                                                            <div className="mt-3">
                                                                <label className="text-[10px] text-slate-500 uppercase tracking-widest">Per-Crew Target/Unit</label>
                                                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {(crew || []).filter(member => member && member.id).map(member => {
                                                                        const isApplicable = mission.assignedTo === null || mission.assignedTo === undefined || (Array.isArray(mission.assignedTo) && mission.assignedTo.includes(member.id));
                                                                        const per = mission.perCrew?.[member.id] || {};
                                                                        return (
                                                                            <div key={member.id} className={`rounded-xl border p-3 ${isApplicable ? 'border-white/10 bg-white/5' : 'border-white/5 bg-white/2 opacity-50'}`}>
                                                                                <div className="text-xs font-bold text-slate-200 mb-2">{member.callsign}</div>
                                                                                <div className="grid grid-cols-2 gap-2">
                                                                                    <div>
                                                                                        <label className="text-[10px] text-slate-500 uppercase tracking-widest">Target</label>
                                                                                        <input
                                                                                            type="number"
                                                                                            className="input-field mt-1"
                                                                                            value={per.defaultTarget ?? ''}
                                                                                            disabled={!isApplicable}
                                                                                            placeholder={String(mission.defaultTarget ?? 20)}
                                                                                            onChange={(e) => {
                                                                                                const current = mission.perCrew || {};
                                                                                                const nextPer = {
                                                                                                    ...current,
                                                                                                    [member.id]: {
                                                                                                        ...(current[member.id] || {}),
                                                                                                        defaultTarget: parseInt(e.target.value) || 0,
                                                                                                    },
                                                                                                };
                                                                                                updateCustomMission(mission.id, { perCrew: nextPer });
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <label className="text-[10px] text-slate-500 uppercase tracking-widest">Unit</label>
                                                                                        <input
                                                                                            className="input-field mt-1"
                                                                                            value={per.unit ?? ''}
                                                                                            disabled={!isApplicable}
                                                                                            placeholder={mission.unit || ''}
                                                                                            onChange={(e) => {
                                                                                                const current = mission.perCrew || {};
                                                                                                const nextPer = {
                                                                                                    ...current,
                                                                                                    [member.id]: {
                                                                                                        ...(current[member.id] || {}),
                                                                                                        unit: e.target.value,
                                                                                                    },
                                                                                                };
                                                                                                updateCustomMission(mission.id, { perCrew: nextPer });
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <p className="mt-2 text-[11px] text-slate-500">Leave empty to use the default target/unit for this protocol.</p>
                                                            </div>
                                                        )}

                                                        <div className="mt-3">
                                                            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Assign To</label>
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateCustomMission(mission.id, { assignedTo: null })}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${mission.assignedTo === null || mission.assignedTo === undefined ? 'bg-primary/20 text-white border-primary/30' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}
                                                                >
                                                                    All Crew
                                                                </button>
                                                                {(crew || []).filter(m => m && m.id).map(m => {
                                                                    const list = Array.isArray(mission.assignedTo) ? mission.assignedTo : [];
                                                                    const selected = list.includes(m.id);
                                                                    return (
                                                                        <button
                                                                            key={m.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const current = Array.isArray(mission.assignedTo) ? mission.assignedTo : [];
                                                                                const next = current.includes(m.id)
                                                                                    ? current.filter(id => id !== m.id)
                                                                                    : [...current, m.id];
                                                                                updateCustomMission(mission.id, { assignedTo: normalizeAssignedTo(next) });
                                                                            }}
                                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${selected ? 'bg-primary/20 text-white border-primary/30' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}
                                                                        >
                                                                            {m.callsign}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        <div className="mt-3">
                                                            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Active Days</label>
                                                            {renderDayChips(mission.activeDays ?? null, (next) => updateCustomMission(mission.id, { activeDays: next }))}
                                                            <p className="mt-2 text-[11px] text-slate-500">Schedule when this protocol appears (Ramadan day 1–30). Every Day means always available.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => bumpMissionOrder(mission, 'up', (u) => updateCustomMission(mission.id, u))}
                                                        className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors text-xs font-bold whitespace-nowrap"
                                                    >
                                                        Up
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => bumpMissionOrder(mission, 'down', (u) => updateCustomMission(mission.id, u))}
                                                        className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors text-xs font-bold whitespace-nowrap"
                                                    >
                                                        Down
                                                    </button>
                                                    <button
                                                        onClick={() => { if (window.confirm('Deactivate this protocol?')) removeCustomMission(mission.id) }}
                                                        className="size-10 flex items-center justify-center rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-600 transition-colors"
                                                        type="button"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
