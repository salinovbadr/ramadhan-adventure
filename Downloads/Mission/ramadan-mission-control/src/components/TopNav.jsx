import { Rocket, Bell, Calendar, Download, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AVATARS, getRank } from '../utils/missions';

export default function TopNav({ activeTab, onNavigate }) {
    const { activeUser, getTotalStars } = useApp();

    const totalStars = activeUser ? getTotalStars(activeUser.id) : 0;
    const rank = getRank(totalStars);
    const avatar = AVATARS.find(a => a.id === activeUser?.avatar);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'analysis', label: 'Mission Analysis' },
        { id: 'leaderboard', label: 'Fleet Leaderboard' },
        { id: 'settings', label: 'Settings' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-white/10 px-6 py-4 bg-background-dark/80 backdrop-blur-md">
            {/* Brand */}
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Rocket size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-white uppercase glow-text leading-tight">
                        Ramadan Mission Control
                    </h2>
                    <p className="text-[10px] text-slate-400 font-medium tracking-widest">STARDATE 1447H</p>
                </div>
            </div>

            {/* Navigation (Desktop) */}
            <nav className="hidden md:flex flex-1 justify-center gap-2">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`text-sm font-medium transition-all px-4 py-2 rounded-full ${activeTab === item.id
                                ? 'text-white font-bold bg-white/10 border border-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                : 'text-slate-400 hover:text-primary hover:bg-white/5'
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* User & Actions */}
            <div className="flex items-center gap-4">

                {/* Notifications */}
                <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/10 hover:border-primary/50 transition-colors text-white relative group">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="text-right hidden lg:block">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">{rank.name}</p>
                        <p className="text-sm font-bold text-white">{activeUser?.callsign || 'Cadet'}</p>
                    </div>

                    <div className="relative group cursor-pointer">
                        <div
                            className="size-10 rounded-full border-2 border-primary/50 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(37,175,244,0.3)] bg-surface-dark overflow-hidden"
                            style={{ color: avatar?.color }}
                        >
                            {avatar?.emoji || '👨‍🚀'}
                        </div>
                        <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-background-dark rounded-full"></div>
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden text-white p-2">
                    <Menu size={24} />
                </button>

            </div>
        </header>
    );
}
