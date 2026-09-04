/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Logo maroon – used ONLY for the navbar logo mark & hero brand strip
        maroon: {
          50:  '#fdf2f4',
          100: '#f9e0e5',
          200: '#f1b8c4',
          300: '#e58095',
          400: '#d44d67',
          500: '#b8294a',
          600: '#8f1e37',
          700: '#6b1528',  // logo background ≈ this shade
          800: '#4d0e1d',
          900: '#3a0916',
          950: '#200408',
        },
        gold: {
          50:  '#fdf9ee',
          100: '#f8efd0',
          200: '#f0db9c',
          300: '#e6c268',
          400: '#dba83e',
          500: '#c49030',
          600: '#a67024',
          700: '#855420',
          800: '#6d4320',
          900: '#5a381f',
          950: '#321d0d',
        },
      },
    },
  },
  plugins: [],
};
