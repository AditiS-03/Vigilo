/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#151f33',
          900: '#0f172a',
          950: '#0b1120'
        },
        cyber: {
          dark: '#030712',
          navy: '#0a1020',
          blue: '#1e3a8a',
          cyan: '#06b6d4',
          accent: '#22d3ee',
          violet: '#8b5cf6',
          purple: '#6d28d9',
          alert: '#ef4444',
          safe: '#10b981'
        }
      },
      backgroundImage: {
        'grid-pattern': "url('data:image/svg+xml;utf8,<svg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 20 0 L 0 0 0 20\" fill=\"none\" stroke=\"rgba(34, 211, 238, 0.05)\" stroke-width=\"1\"/></svg>')",
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.3)',
        'neon-violet': '0 0 15px rgba(139, 92, 246, 0.3)',
        'glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        }
      }
    },
  },
  plugins: [],
}
