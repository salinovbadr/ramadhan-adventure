import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Flame, Rocket, Star, Medal } from 'lucide-react';
import { getRank, AVATARS } from '../utils/missions';

export default function Leaderboard() {
    const { crew, activeUser, getTotalStars, getPerfectStreak } = useApp();

    const leaderboardData = useMemo(() => {
        return crew
            .map(member => {
                const totalStars = getTotalStars(member.id);
                const efficiency = 0; // Placeholder efficiency calculation
                const rank = getRank(totalStars);
                const avatar = AVATARS.find(a => a.id === member.avatar);

                return {
                    ...member,
                    totalStars,
                    efficiency,
                    streak: getPerfectStreak(member.id),
                    rank,
                    avatar
                };
            })
            .sort((a, b) => b.totalStars - a.totalStars); // Sort by Stars
    }, [crew, getTotalStars, getPerfectStreak]);

    const top3 = leaderboardData.slice(0, 3);
    const restOfCrew = leaderboardData.slice(3);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-2 text-primary">
                    <span className="text-xs font-bold uppercase tracking-widest">Global Positioning: Earth</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white uppercase">Galactic Fleet Rankings</h1>
                <p className="text-slate-400 text-base">Ramadan Cycle 1447 • Mission Status: <span className="text-emerald-400 font-bold">ACTIVE</span></p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Main Content: Podium & Table */}
                <div className="xl:col-span-8 2xl:col-span-9 flex flex-col gap-8">

                    {/* Podium */}
                    {top3.length > 0 && (
                        <div className="relative rounded-2xl bg-surface-dark/50 border border-slate-700/50 p-6 md:p-10 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
                            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

                            <div className="relative flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 min-h-[300px] pt-10">

                                {/* Rank 2 */}
                                {top3[1] && (
                                    <div className="order-2 md:order-1 flex flex-col items-center gap-3 w-full md:w-1/3 max-w-[240px]">
                                        <div className="relative">
                                            <span className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 border border-slate-600 text-white font-bold shadow-lg">2</span>
                                            <div className="size-24 md:size-28 rounded-full border-4 border-slate-600 p-1 bg-surface-dark shadow-[0_0_15px_rgba(37,175,244,0.15)] flex items-center justify-center text-4xl" style={{ backgroundColor: top3[1].avatar.bg }}>
                                                {top3[1].avatar.emoji}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 text-xs font-bold text-slate-300 mb-1">
                                                <Medal size={14} className="text-slate-400" />
                                                {top3[1].rank.name}
                                            </div>
                                            <h3 className="text-xl font-bold text-white">{top3[1].callsign}</h3>
                                            <p className="text-primary font-bold text-2xl">{top3[1].totalStars} <span className="text-sm font-normal text-slate-400">Stars</span></p>
                                        </div>
                                        <div className="w-full h-24 md:h-32 bg-slate-800/50 rounded-t-xl border-t border-x border-slate-700/50 mt-2 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                                        </div>
                                    </div>
                                )}

                                {/* Rank 1 */}
                                {top3[0] && (
                                    <div className="order-1 md:order-2 flex flex-col items-center gap-3 w-full md:w-1/3 max-w-[280px] -mt-10 md:-mt-16 z-10">
                                        <div className="relative">
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-accent-gold animate-bounce">
                                                <Trophy size={48} fill="currentColor" />
                                            </div>
                                            <span className="absolute -bottom-2 z-20 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent-gold text-slate-900 text-xs font-bold uppercase rounded-full shadow-lg border border-yellow-300 whitespace-nowrap">Current Leader</span>
                                            <div className="size-32 md:size-40 rounded-full border-4 border-accent-gold p-1 bg-surface-dark shadow-glow-gold flex items-center justify-center text-6xl" style={{ backgroundColor: top3[0].avatar.bg }}>
                                                {top3[0].avatar.emoji}
                                            </div>
                                        </div>
                                        <div className="text-center mt-4">
                                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-gold/20 border border-accent-gold/50 text-xs font-bold text-accent-gold mb-1 shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                                                <Medal size={14} />
                                                {top3[0].rank.name}
                                            </div>
                                            <h3 className="text-2xl font-bold text-white glow-text">{top3[0].callsign}</h3>
                                            <p className="text-accent-gold font-bold text-3xl">{top3[0].totalStars} <span className="text-sm font-normal text-slate-400">Stars</span></p>
                                        </div>
                                        <div className="w-full h-32 md:h-48 bg-slate-800/80 rounded-t-xl border-t border-x border-accent-gold/30 mt-2 relative overflow-hidden shadow-[0_-5px_20px_rgba(251,191,36,0.1)]">
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-accent-gold/5 to-transparent"></div>
                                        </div>
                                    </div>
                                )}

                                {/* Rank 3 */}
                                {top3[2] && (
                                    <div className="order-3 flex flex-col items-center gap-3 w-full md:w-1/3 max-w-[240px]">
                                        <div className="relative">
                                            <span className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 border border-slate-600 text-white font-bold shadow-lg">3</span>
                                            <div className="size-24 md:size-28 rounded-full border-4 border-slate-600 p-1 bg-surface-dark shadow-[0_0_15px_rgba(37,175,244,0.15)] flex items-center justify-center text-4xl" style={{ backgroundColor: top3[2].avatar.bg }}>
                                                {top3[2].avatar.emoji}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 text-xs font-bold text-slate-300 mb-1">
                                                <Medal size={14} className="text-amber-700" />
                                                {top3[2].rank.name}
                                            </div>
                                            <h3 className="text-xl font-bold text-white">{top3[2].callsign}</h3>
                                            <p className="text-primary font-bold text-2xl">{top3[2].totalStars} <span className="text-sm font-normal text-slate-400">Stars</span></p>
                                        </div>
                                        <div className="w-full h-20 md:h-24 bg-slate-800/50 rounded-t-xl border-t border-x border-slate-700/50 mt-2 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Roster Table */}
                    <div className="rounded-2xl border border-slate-700/50 bg-surface-dark overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Rocket size={18} className="text-primary" />
                                Fleet Roster
                            </h3>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold w-24">Rank</th>
                                        <th className="px-6 py-4 font-semibold">Pilot Name</th>
                                        <th className="px-6 py-4 font-semibold text-right">Mission Points</th>
                                        <th className="px-6 py-4 font-semibold text-center">Streak</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50 text-sm">
                                    {leaderboardData.map((member, idx) => (
                                        <tr key={member.id} className="group hover:bg-slate-800/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded font-bold ${idx < 3 ? 'bg-accent-gold/10 text-accent-gold' : 'bg-slate-700 text-slate-300'}`}>
                                                    {idx + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full border border-slate-600 flex items-center justify-center text-xl" style={{ backgroundColor: member.avatar.bg }}>
                                                        {member.avatar.emoji}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-base">{member.callsign}</p>
                                                        <p className="text-xs text-slate-400">{member.rank.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-white text-base font-bold">{member.totalStars}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold">
                                                    <Flame size={14} className={member.id === activeUser?.id ? 'animate-pulse' : ''} />
                                                    {member.streak || 0} Days
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Sidebar Stats */}
                <div className="xl:col-span-4 2xl:col-span-3 flex flex-col gap-6">
                    {/* MVP Card */}
                    <div className="bg-gradient-to-br from-surface-dark to-slate-900 rounded-2xl border border-accent-gold/30 p-1 relative overflow-hidden shadow-lg group">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/20 via-transparent to-accent-gold/20 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <div className="bg-surface-dark rounded-xl p-6 relative z-10 h-full flex flex-col items-center text-center">
                            <div className="absolute top-0 right-8 w-16 h-1 bg-accent-gold shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                            <div className="mb-4 relative">
                                <div className="absolute -top-4 -right-4 bg-accent-gold rounded-full p-1.5 shadow-lg border-2 border-slate-800">
                                    <Trophy size={20} className="text-slate-900" />
                                </div>
                                <div className="size-20 rounded-full border-2 border-accent-gold p-1 flex items-center justify-center text-4xl bg-surface-dark" style={{ backgroundColor: top3[0]?.avatar?.bg }}>
                                    {top3[0]?.avatar?.emoji}
                                </div>
                            </div>
                            <h3 className="text-accent-gold text-xs font-bold uppercase tracking-widest mb-1">Weekly MVP</h3>
                            <h4 className="text-2xl font-bold text-white mb-2">{top3[0]?.callsign}</h4>
                            <div className="bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700 mb-4">
                                <span className="text-green-400 font-bold text-lg">+{top3[0]?.totalStars}</span>
                                <span className="text-slate-400 text-sm"> pts total</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
