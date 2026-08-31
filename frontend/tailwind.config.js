/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Tema futurista / cyberpunk
        cyber: {
          black: '#0a0a1f',
          dark: '#10102e',
          dark2: '#16163a',
          panel: '#1c1c46',
          border: '#2a2a66',
          purple: '#8b5cf6',
          magenta: '#d946ef',
          cyan: '#22d3ee',
          green: '#10b981',
          pink: '#f472b6',
          text: '#a5a6c9',
          glow: '#6d5efc'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'neon': '0 0 20px rgba(139, 92, 246, 0.5)',
        'neon-cyan': '0 0 20px rgba(34, 211, 238, 0.5)',
        'neon-pink': '0 0 20px rgba(217, 70, 239, 0.5)',
        'glow': '0 0 40px rgba(109, 94, 252, 0.15)'
      },
      backgroundImage: {
        'gradient-cyber': 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #22d3ee 100%)',
        'gradient-cyber-hover': 'linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #0891b2 100%)',
        'gradient-night': 'radial-gradient(ellipse at top, #1c1c46 0%, #0a0a1f 70%)'
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        }
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite'
      },
      spacing: {
        'player': '90px'
      }
    }
  },
  plugins: []
}
