import React from 'react';

// Common props for consistent styling
const defaultProps = {
    width: "40",
    height: "40",
    viewBox: "0 0 40 40",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
};

export const IconPrayer = (props) => (
    <svg {...defaultProps} {...props}>
        {/* Mosque Dome - Flat/Isometric style */}
        <path d="M20 8C15 8 11 12 11 17V24H29V17C29 12 25 8 20 8Z" fill="url(#prayer-gradient)" />
        <path d="M20 6V8" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="5" r="1.5" fill="#FFD700" />
        <rect x="12" y="24" width="16" height="8" rx="1" fill="#2D3748" />
        <rect x="18" y="26" width="4" height="6" rx="2" fill="#4A5568" />
        <defs>
            <linearGradient id="prayer-gradient" x1="20" y1="8" x2="20" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4FD1C5" />
                <stop offset="1" stopColor="#319795" />
            </linearGradient>
        </defs>
    </svg>
);

export const IconQuran = (props) => (
    <svg {...defaultProps} {...props}>
        {/* Open Book */}
        <path d="M20 10V30" stroke="#CBD5E0" strokeWidth="1" />
        <path d="M10 12C10 12 14 13 20 12M20 12C26 13 30 12 30 12" stroke="#A0AEC0" strokeWidth="1" />
        <rect x="8" y="10" width="12" height="18" rx="1" transform="rotate(5 8 10)" fill="url(#quran-left)" />
        <rect x="20" y="11" width="12" height="18" rx="1" transform="rotate(-5 20 11)" fill="url(#quran-right)" />
        <path d="M20 30L8 28M20 30L32 28" stroke="#718096" strokeWidth="2" strokeLinecap="round" />
        <defs>
            <linearGradient id="quran-left" x1="8" y1="10" x2="20" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#63B3ED" />
                <stop offset="1" stopColor="#4299E1" />
            </linearGradient>
            <linearGradient id="quran-right" x1="20" y1="11" x2="32" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#63B3ED" />
                <stop offset="1" stopColor="#3182CE" />
            </linearGradient>
        </defs>
    </svg>
);

export const IconDua = (props) => (
    <svg {...defaultProps} {...props}>
        {/* Hands in Dua */}
        <path d="M14 28V18C14 15.7909 15.7909 14 18 14H19V28H14Z" fill="#F6E05E" />
        <path d="M26 28V18C26 15.7909 24.2091 14 22 14H21V28H26Z" fill="#ECC94B" />
        <path d="M10 32C10 32 14 30 20 30C26 30 30 32 30 32" stroke="#CBD5E0" strokeWidth="2" strokeLinecap="round" />
        {/* Glow effect */}
        <circle cx="20" cy="12" r="6" fill="url(#dua-glow)" opacity="0.4" />
        <defs>
            <radialGradient id="dua-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 12) rotate(90) scale(6)">
                <stop stopColor="#FAF089" />
                <stop offset="1" stopColor="#FAF089" stopOpacity="0" />
            </radialGradient>
        </defs>
    </svg>
);

export const IconMoon = (props) => (
    <svg {...defaultProps} {...props}>
        <path d="M26 12.5C26 18.299 21.299 23 15.5 23C13.2925 23 11.2464 22.3188 9.53955 21.1441C10.7444 24.6295 14.0536 27.125 18 27.125C22.9706 27.125 27 23.0956 27 18.125C27 15.6568 26 13.4194 24.3792 11.8385C25.4328 11.9429 26 12.5 26 12.5Z" fill="#F6E05E" />
        <circle cx="24" cy="10" r="1" fill="#FFF" />
        <circle cx="10" cy="24" r="0.5" fill="#FFF" />
    </svg>
);

export const IconCharity = (props) => (
    <svg {...defaultProps} {...props}>
        <path d="M20 28L12 20C10 18 10 15 12 13C14 11 17 11 19 13L20 14L21 13C23 11 26 11 28 13C30 15 30 18 28 20L20 28Z" fill="#F687B3" />
        <path d="M16 28V32H24V28" stroke="#CBD5E0" strokeWidth="2" />
    </svg>
);

export const IconAstronaut = (props) => (
    <svg {...defaultProps} {...props}>
        {/* Simple Astronaut Head */}
        <rect x="12" y="10" width="16" height="16" rx="4" fill="#E2E8F0" />
        <rect x="14" y="12" width="12" height="10" rx="2" fill="#2D3748" />
        {/* Reflection */}
        <path d="M22 14L24 16" stroke="#4FD1C5" strokeWidth="1" opacity="0.5" />
    </svg>
);

export const IconStar = (props) => (
    <svg {...defaultProps} {...props}>
        <path d="M20 4L24 14L35 14L26 20L29 30L20 24L11 30L14 20L5 14L16 14L20 4Z" fill="#F6E05E" stroke="#B7791F" strokeWidth="1" />
    </svg>
);

export const IconRocket = (props) => (
    <svg {...defaultProps} {...props}>
        <path d="M20 6C20 6 24 14 24 20C24 24 22 28 20 28C18 28 16 24 16 20C16 14 20 6 20 6Z" fill="#F56565" />
        <path d="M16 22L12 26V22H16Z" fill="#C53030" />
        <path d="M24 22L28 26V22H24Z" fill="#C53030" />
        <circle cx="20" cy="18" r="2" fill="#2D3748" />
    </svg>
);

export const IconCheck = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Map existing emojis to new icons
export const getMissionIcon = (id, iconChar) => {
    // Logic to select icon based on ID or fallback to char
    const map = {
        'sahur_istighfar': <IconMoon />,
        'fajr': <IconPrayer />,
        'dhuhr': <IconPrayer />,
        'asr': <IconPrayer />,
        'maghrib': <IconPrayer />,
        'isha': <IconPrayer />,
        'tarawih': <IconStar />, // Special prayer
        'tilawah': <IconQuran />,
        'dzikir': <IconDua />,
        'sedekah': <IconCharity />,
        'study': <IconQuran />, // Generic study
        'dua': <IconDua />,
    };

    // If custom mission, check if we can map the emoji or return a default custom icon
    // For now, return mapped icon or the generic astronaut/star if not found
    if (map[id]) return map[id];

    // Heuristic for custom missions based on emoji
    if (iconChar === '🌙') return <IconMoon />;
    if (iconChar === '📖') return <IconQuran />;
    if (iconChar === '🤲') return <IconDua />;
    if (iconChar === '🕌') return <IconPrayer />;
    if (iconChar === '💰') return <IconCharity />;

    return <IconAstronaut />;
};
