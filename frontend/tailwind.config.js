// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c0ff',
          300: '#66a0ff',
          400: '#3380ff',
          500: '#0060ff',
          600: '#0054e6',
          700: '#0048cc',
          800: '#003cb3',
          900: '#003099',
        },
        red: {
          50: '#ffebeb',
          100: '#ffd6d6',
          200: '#ffadad',
          300: '#ff8585',
          400: '#ff5c5c',
          500: '#ff3333',
          600: '#e62e2e',
          700: '#cc2929',
          800: '#b32323',
          900: '#991e1e',
        },
        green: {
          50: '#e6f7e6',
          100: '#ccefcc',
          200: '#99df99',
          300: '#66cf66',
          400: '#33bf33',
          500: '#00af00',
          600: '#009e00',
          700: '#008d00',
          800: '#007b00',
          900: '#006a00',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}