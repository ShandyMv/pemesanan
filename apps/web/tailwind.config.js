/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        background: '#f8fafc',
      },
      boxShadow: {
        'soft': '0 12px 30px -18px rgba(15, 23, 42, 0.35)',
        'glass': '0 12px 40px -24px rgba(15, 23, 42, 0.45)',
      }
    },
  },
  plugins: [],
}
