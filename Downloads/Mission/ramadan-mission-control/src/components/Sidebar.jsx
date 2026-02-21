import { useApp } from '../context/AppContext';
import { AVATARS } from '../utils/missions';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '🚀' },
    { id: 'analysis', label: 'Mission Analysis', icon: '📊' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ activePage, onNavigate }) {
    const { activeUser } = useApp();
    const avatar = AVATARS.find(a => a.id === activeUser?.avatar) || AVATARS[0];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-30"
            style={{
                background: 'rgba(11, 14, 20, 0.95)',
                borderRight: '1px solid rgba(138, 43, 226, 0.12)',
                backdropFilter: 'blur(20px)',
            }}
        >
            {/* Logo */}
            <div className="px-5 py-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                    style={{ background: 'linear-gradient(135deg, #8A2BE2, #00BFFF)' }}
                >
                    🚀
                </div>
                <div>
                    <h1 className="font-display text-sm font-bold tracking-wider text-white">MISSION CTRL</h1>
                    <p className="text-[10px] tracking-widest" style={{ color: '#00BFFF' }}>STARDATE 1447H</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 mt-4 space-y-1">
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`sidebar-link w-full ${activePage === item.id ? 'active' : ''}`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* User Card */}
            {activeUser && (
                <div className="px-4 py-4 mx-3 mb-4 rounded-lg"
                    style={{
                        background: 'rgba(138, 43, 226, 0.08)',
                        border: '1px solid rgba(138, 43, 226, 0.15)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ background: avatar.color + '30', color: avatar.color }}
                        >
                            {activeUser.callsign?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">{activeUser.callsign}</p>
                            <p className="text-[10px] uppercase tracking-wider" style={{ color: avatar.color }}>
                                {activeUser.difficulty?.toUpperCase() || 'CADET'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
