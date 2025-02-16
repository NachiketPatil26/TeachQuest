/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
  },
  plugins: [],
};
