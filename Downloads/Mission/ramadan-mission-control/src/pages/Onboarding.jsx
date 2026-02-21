import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AVATARS, DIFFICULTY_LEVELS } from '../utils/missions';

export default function Onboarding({ onDone }) {
    const { createFirstMember } = useApp();

    const [callsign, setCallsign] = useState('');
    const [difficulty, setDifficulty] = useState('cadet');
    const [avatar, setAvatar] = useState('rocket');

    const handleStart = (e) => {
        e.preventDefault();
        const name = callsign.trim();
        if (!name) return;

        createFirstMember({
            id: `${name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}_${Date.now()}`,
            callsign: name,
            avatar,
            avatarColor: '#25aff4',
            difficulty,
            createdAt: new Date().toISOString(),
        });

        onDone?.();
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <div className="w-full max-w-2xl glass-panel rounded-2xl p-6 md:p-10">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight uppercase glow-text">Initialize Mission Control</h1>
                    <p className="text-slate-400">Create your first crew member to start logging daily missions.</p>
                </div>

                <form onSubmit={handleStart} className="space-y-8">
                    <div>
                        <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2">Callsign (Name)</label>
                        <input
                            type="text"
                            value={callsign}
                            onChange={(e) => setCallsign(e.target.value)}
                            placeholder="e.g. Abah"
                            className="input-field text-lg"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-xs uppercase tracking-wider mb-3">Avatar</label>
                        <div className="grid grid-cols-6 gap-2">
                            {AVATARS.map(a => (
                                <button
                                    key={a.id}
                                    type="button"
                                    onClick={() => setAvatar(a.id)}
                                    className={`size-12 rounded-full flex items-center justify-center text-xl transition-transform hover:scale-105 ${avatar === a.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-dark' : 'opacity-80 hover:opacity-100'}`}
                                    style={{ backgroundColor: a.bg }}
                                >
                                    {a.emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-xs uppercase tracking-wider mb-3">Rank Difficulty</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                                <label
                                    key={key}
                                    className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${difficulty === key ? 'bg-primary/10 border-primary shadow-glow-primary' : 'bg-surface-dark border-slate-700 hover:border-slate-500'}`}
                                >
                                    <input
                                        type="radio"
                                        name="difficulty"
                                        className="sr-only"
                                        checked={difficulty === key}
                                        onChange={() => setDifficulty(key)}
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`font-bold text-sm ${difficulty === key ? 'text-white' : 'text-slate-300'}`}>{level.label}</span>
                                            <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 rounded">{level.multiplier}x</span>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="btn-primary">Start Missions</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
