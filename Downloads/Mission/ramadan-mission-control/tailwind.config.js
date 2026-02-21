/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // New Dashboard Palette
        "primary": "#25aff4", // Bright Blue
        "primary-dark": "#1a7ab0",
        "background-light": "#f5f7f8", // Light Mode
        "background-dark": "#0b1215",  // Deep Space Dark (Base BG)
        "surface-dark": "#162026",     // Panel BG
        "accent-purple": "#a855f7",    // Phase 1 / Magic
        "accent-gold": "#fbbf24",     // Phase 3 / Reward / Stars
        "accent-green": "#22c55e",     // Success / Active
        "neon-blue": "#00f3ff",        // Highlights
        "glass-border": "rgba(255, 255, 255, 0.08)",

        // Legacy/Compat mappings (softly deprecated or remapped)
        space: {
          900: '#0b1215', // Remap to new bg-dark
          800: '#162026', // Remap to new surface
          700: '#1e293b',
          600: '#334155',
        },
        neon: {
          blue: '#25aff4',
          purple: '#a855f7',
          gold: '#fbbf24',
          cyan: '#00f3ff',
          pink: '#ec4899',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'sans-serif'], // Default to Space Grotesk per design
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'star-pattern': "radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px), radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 3px)",
        'gradient-primary': 'linear-gradient(135deg, #25aff4 0%, #a855f7 100%)',
        'gradient-surface': 'linear-gradient(180deg, rgba(22, 32, 38, 0.8) 0%, rgba(11, 18, 21, 0.8) 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px -5px rgba(37, 175, 244, 0.4)',
        'glow-purple': '0 0 20px -5px rgba(168, 85, 247, 0.4)',
        'glow-gold': '0 0 20px -5px rgba(251, 191, 36, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
