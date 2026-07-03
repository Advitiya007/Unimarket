/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        campus: {
          blue: {
            DEFAULT: '#1E3A8A',
            50: '#EEF2FF',
            100: '#E0E7FF',
            400: '#3B5BDB',
            500: '#1E3A8A',
            600: '#182F6E',
            700: '#122452',
          },
          emerald: {
            DEFAULT: '#0F9D68',
            50: '#ECFDF5',
            100: '#D1FAE5',
            500: '#0F9D68',
            600: '#0C7F54',
          },
          orange: {
            DEFAULT: '#F97316',
            50: '#FFF7ED',
            100: '#FFEDD5',
            500: '#F97316',
            600: '#EA580C',
          },
          ink: '#12172B',
          paper: '#F7F8FC',
        },
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,23,43,0.04), 0 8px 24px -12px rgba(18,23,43,0.12)',
        cardHover: '0 4px 12px rgba(18,23,43,0.08), 0 16px 32px -12px rgba(18,23,43,0.18)',
      },
    },
  },
  plugins: [],
};
