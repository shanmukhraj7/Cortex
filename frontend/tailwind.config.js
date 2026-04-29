/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'system-ui', 'sans-serif'],
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        /* ── Carbon / Dark palette for backgrounds ── */
        carbon: {
          50:  '#e5e5e5',
          100: '#a3a3a3', // Muted text
          200: '#737373',
          300: '#525252',
          400: '#404040',
          500: '#262626', // Subtle borders
          600: '#1a1a1a',
          700: '#171717', // Input backgrounds
          800: '#121212', // Card backgrounds
          900: '#0b0a0a', // Base background
          950: '#050505',
        },
        /* ── Coral / Vibrant Orange accent ── */
        coral: {
          50:  '#fff0eb',
          100: '#ffdbcc',
          200: '#ffbf99',
          300: '#ff9a66',
          400: '#ff7733',
          500: '#ff5722', // Primary accent
          600: '#e64a19',
          700: '#cc3b14',
          800: '#a62d0f',
          900: '#80210a',
        },
      },
      backgroundImage: {
        /* Subtle radial glow for top-right background */
        'glow-radial': 'radial-gradient(circle at 80% 0%, rgba(255, 87, 34, 0.08) 0%, rgba(11, 10, 10, 0) 50%)',
      },
      animation: {
        'fade-in':  'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer':  'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        slideUp: { '0%': { opacity:'0', transform:'translateY(12px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition:'-200% 0' }, '100%': { backgroundPosition:'200% 0' } },
      },
      boxShadow: {
        'panel': '0 10px 30px -10px rgba(0,0,0,0.8)',
      },
    },
  },
  plugins: [],
}