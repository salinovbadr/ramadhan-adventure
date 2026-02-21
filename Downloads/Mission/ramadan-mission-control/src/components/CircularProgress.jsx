export default function CircularProgress({ percent = 0, size = 100, strokeWidth = 8, color = '#8A2BE2', label = '', sublabel = '' }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    const center = size / 2;

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress arc */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        transition: 'stroke-dashoffset 0.8s ease',
                        filter: `drop-shadow(0 0 6px ${color}60)`,
                    }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
                <span className="text-lg font-bold font-display" style={{ color }}>{Math.round(percent)}%</span>
                {sublabel && <span className="text-[10px] text-gray-400 mt-0.5">{sublabel}</span>}
            </div>
            {label && <span className="text-xs text-gray-400 mt-2 font-medium">{label}</span>}
        </div>
    );
}
