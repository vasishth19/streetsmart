/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // NEON NOIR palette
        bg: {
          primary: '#05080F',
          secondary: '#0B1020',
          tertiary: '#0D1526',
        },
        neon: {
          green: '#00FF9C',
          cyan: '#00E5FF',
          purple: '#B388FF',
          pink: '#FF69B4',
        },
        warning: {
          red: '#FF3B3B',
          amber: '#FFB020',
        },
        text: {
          primary: '#E6F1FF',
          secondary: '#8892B0',
          muted: '#4A5568',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
        'neon-glow-green': 'radial-gradient(ellipse at center, rgba(0,255,156,0.15) 0%, transparent 70%)',
        'neon-glow-cyan': 'radial-gradient(ellipse at center, rgba(0,229,255,0.15) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(0,255,156,0.4), 0 0 40px rgba(0,255,156,0.2)',
        'neon-cyan': '0 0 20px rgba(0,229,255,0.4), 0 0 40px rgba(0,229,255,0.2)',
        'neon-red': '0 0 20px rgba(255,59,59,0.4), 0 0 40px rgba(255,59,59,0.2)',
        'neon-amber': '0 0 20px rgba(255,176,32,0.4), 0 0 40px rgba(255,176,32,0.2)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'flicker': 'flicker 4s linear infinite',
        'grid-move': 'gridMove 20s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: 0.7, filter: 'brightness(1.3)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: 1 },
          '96%': { opacity: 0.8 },
          '97%': { opacity: 1 },
          '98%': { opacity: 0.6 },
          '99%': { opacity: 1 },
        },
        gridMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '40px 40px' },
        },
      },
    },
  },
  plugins: [],
};