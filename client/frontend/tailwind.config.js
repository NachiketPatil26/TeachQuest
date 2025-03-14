/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
<<<<<<< HEAD
  theme: {
    extend: {},
=======
  darkMode: 'class',
  theme: {
    extend: {
      backgroundColor: {
        dark: {
          primary: '#1a1a1a',
          secondary: '#2d2d2d',
          accent: '#8BAF9A'
        }
      },
      textColor: {
        dark: {
          primary: '#ffffff',
          secondary: '#a0aec0',
          accent: '#9FC0AE'
        }
      }
    },
>>>>>>> a5d9b927743499379847008cef184e48bd465b17
  },
  plugins: [],
};
