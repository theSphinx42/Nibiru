/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quantum: {
          100: '#E6E8FF',
          200: '#B8BEFF',
          300: '#8A94FF',
          400: '#5C6AFF',
          500: '#2E40FF',
          600: '#0016FF',
          700: '#0012CC',
          800: '#000D99',
          900: '#000966',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #2E40FF' },
          '100%': { boxShadow: '0 0 20px #2E40FF' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
} 