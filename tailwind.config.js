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
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        earth: {
          100: '#f3e8a0',
          500: '#8b7355',
          700: '#654321',
        }
      }
    },
  },
  plugins: [],
}
