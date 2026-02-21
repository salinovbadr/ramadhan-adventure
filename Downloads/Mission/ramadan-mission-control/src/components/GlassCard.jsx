export default function GlassCard({ children, className = '', variant = 'default', ...props }) {
    const variantClass = {
        default: 'glass-card',
        blue: 'glass-card-blue',
        gold: 'glass-card-gold',
    }[variant] || 'glass-card';

    return (
        <div className={`${variantClass} p-5 ${className}`} {...props}>
            {children}
        </div>
    );
}
