/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        quantum: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      dropShadow: {
        'glow': '0 0 8px rgba(59, 130, 246, 0.5)',
      },
      animation: {
        'quantum-pulse': 'quantum-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'quantum-glow': 'quantum-glow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'quantum-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'quantum-glow': {
          '0%, 100%': {
            filter: 'brightness(1)',
          },
          '50%': {
            filter: 'brightness(1.2)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      zIndex: {
        behind: '-10',
        background: '0',
        base: '10',
        overlay: '50',
        modal: '100',
        toast: '150',
        glyph: '200',
        max: '9999',
      },
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
}; 