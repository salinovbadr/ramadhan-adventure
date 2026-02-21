// Mission definitions and XP configuration
export const MISSIONS = [
    {
        id: 'sahur',
        name: 'Sahur + Istighfar',
        description: 'Wake up for Sahur and recite Istighfar',
        icon: '🌙',
        type: 'boolean',
        baseXP: 30,
        category: 'ibadah',
    },
    {
        id: 'fajr',
        name: 'Fajr Prayer',
        description: 'Perform Fajr prayer on time',
        icon: '🕌',
        type: 'boolean',
        baseXP: 50,
        category: 'prayer',
    },
    {
        id: 'dhuhr',
        name: 'Dhuhr Prayer',
        description: 'Perform Dhuhr prayer on time',
        icon: '🕌',
        type: 'boolean',
        baseXP: 40,
        category: 'prayer',
    },
    {
        id: 'asr',
        name: 'Asr Prayer',
        description: 'Perform Asr prayer on time',
        icon: '🕌',
        type: 'boolean',
        baseXP: 40,
        category: 'prayer',
    },
    {
        id: 'maghrib',
        name: 'Maghrib Prayer & Iftar',
        description: 'Perform Maghrib prayer and break fast',
        icon: '🕌',
        type: 'boolean',
        baseXP: 50,
        category: 'prayer',
    },
    {
        id: 'isha',
        name: 'Isha Prayer',
        description: 'Perform Isha prayer on time',
        icon: '🕌',
        type: 'boolean',
        baseXP: 40,
        category: 'prayer',
    },
    {
        id: 'tilawah',
        name: 'Tilawah Al-Quran',
        description: 'Daily Quran reading pages',
        icon: '📖',
        type: 'partial',
        baseXP: 100,
        maxStars: 3,
        defaultTarget: 20,
        unit: 'pages',
        category: 'quran',
    },
    {
        id: 'dzikir',
        name: 'Dzikir Pagi/Petang',
        description: 'Morning and evening remembrance',
        icon: '📿',
        type: 'boolean',
        baseXP: 30,
        category: 'ibadah',
    },
    {
        id: 'tarawih',
        name: 'Tarawih Prayer',
        description: 'Perform Tarawih prayer (8-20 rakaat)',
        icon: '🌟',
        type: 'boolean',
        baseXP: 60,
        category: 'prayer',
    },
    {
        id: 'sedekah',
        name: 'Sedekah / Charity',
        description: 'Give charity or perform acts of kindness',
        icon: '💝',
        type: 'boolean',
        baseXP: 40,
        category: 'amal',
    },
    {
        id: 'tadarus',
        name: 'Tadarus / Study Circle',
        description: 'Join or conduct Islamic study',
        icon: '📚',
        type: 'boolean',
        baseXP: 35,
        category: 'quran',
    },
    {
        id: 'dua',
        name: 'Special Du\'a',
        description: 'Make heartfelt supplications',
        icon: '🤲',
        type: 'boolean',
        baseXP: 25,
        category: 'ibadah',
    },
];

export const DIFFICULTY_LEVELS = {
    cadet: { label: 'Cadet', multiplier: 1.0, color: '#00BFFF' },
    officer: { label: 'Officer', multiplier: 1.5, color: '#8A2BE2' },
    commander: { label: 'Commander', multiplier: 2.0, color: '#FFD700' },
};

export const RANKS = [
    { minStars: 0, name: 'Space Cadet', color: '#6B7280' },
    { minStars: 200, name: 'Junior Recruit', color: '#00BFFF' },
    { minStars: 500, name: 'Flight Officer', color: '#3B82F6' },
    { minStars: 1000, name: 'Chief Pilot', color: '#8A2BE2' },
    { minStars: 2000, name: 'Star Commander', color: '#FFD700' },
    { minStars: 4000, name: 'Galaxy Admiral', color: '#FF6347' },
    { minStars: 6000, name: 'Cosmic Legend', color: '#FF1493' },
];

export const PHASES = [
    { id: 1, name: 'Rahmat', subtitle: 'Mercy', days: [1, 10], color: '#00BFFF' },
    { id: 2, name: 'Maghfirah', subtitle: 'Forgiveness', days: [11, 20], color: '#8A2BE2' },
    { id: 3, name: 'Itqun Minan Nar', subtitle: 'Protection from Fire', days: [21, 30], color: '#FFD700' },
];

export const AVATARS = [
    { id: 'rocket', emoji: '🚀', color: '#8A2BE2' },
    { id: 'star', emoji: '⭐', color: '#FFD700' },
    { id: 'moon', emoji: '🌙', color: '#00BFFF' },
    { id: 'planet', emoji: '🪐', color: '#FF6347' },
    { id: 'astronaut', emoji: '👨‍🚀', color: '#3B82F6' },
    { id: 'satellite', emoji: '🛸', color: '#22C55E' },
    { id: 'comet', emoji: '☄️', color: '#F59E0B' },
    { id: 'galaxy', emoji: '🌌', color: '#EC4899' },
];

export const REWARD_GOALS = [
    { id: 'pizza', name: 'Family Pizza Night', target: 5000, emoji: '🍕' },
    { id: 'outing', name: 'Family Day Out', target: 10000, emoji: '🎡' },
    { id: 'gift', name: 'Eid Special Gift', target: 15000, emoji: '🎁' },
    { id: 'vacation', name: 'Family Vacation', target: 20000, emoji: '✈️' },
];

export function getRank(totalStars) {
    let rank = RANKS[0];
    for (const r of RANKS) {
        if (totalStars >= r.minStars) rank = r;
    }
    return rank;
}

export function calculateMissionXP(mission, value, difficulty = 'cadet') {
    const multiplier = DIFFICULTY_LEVELS[difficulty]?.multiplier || 1;
    if (mission.type === 'boolean') {
        return value ? Math.round(mission.baseXP * multiplier) : 0;
    }
    if (mission.type === 'partial') {
        const achieved = Number.isFinite(value?.achieved) ? value.achieved : 0;
        const target = Number.isFinite(value?.target) && value.target > 0 ? value.target : 1;
        const ratio = Math.min(achieved / target, 1);
        return Math.round(mission.baseXP * ratio * multiplier);
    }
    return 0;
}

export function calculateStarsFromXP(xp, maxXP) {
    if (maxXP === 0) return 0;
    const ratio = xp / maxXP;
    if (ratio >= 1) return 3;
    if (ratio >= 0.66) return 2;
    if (ratio >= 0.33) return 1;
    return 0;
}

// Ramadan 1447H approximate dates (Feb 28 - Mar 29, 2026)
export const RAMADAN_START = '2026-02-28';
export const RAMADAN_DAYS = 30;

export function getRamadanDay(dateStr) {
    const start = new Date(RAMADAN_START);
    const current = new Date(dateStr);
    const diffTime = current.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(diffDays, RAMADAN_DAYS));
}

export function getPhaseForDay(day) {
    if (day <= 10) return PHASES[0];
    if (day <= 20) return PHASES[1];
    return PHASES[2];
}
