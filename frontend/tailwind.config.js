/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          50: '#ecf9ff',
          100: '#d4f1ff',
          200: '#aee5ff',
          300: '#75d3ff',
          400: '#36bfff',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        violet: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        fuchsia: {
          50: '#fdf4ff',
          100: '#fce7ff',
          200: '#fbcffe',
          300: '#f8b4fe',
          400: '#f472b6',
          500: '#ec4899',
          600: '#be185d',
          700: '#be123c',
          800: '#831843',
          900: '#500724',
        }
      },
      fontFamily: {
        bricolage: ['Bricolage Grotesque', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-in-out',
        'pulse-custom': 'pulse-custom 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-custom': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        wave: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      }
    }
  },
  plugins: []
}
