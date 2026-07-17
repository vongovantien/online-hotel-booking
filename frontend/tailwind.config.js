/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hotel: {
          dark: '#0A0E17',
          card: '#151C2C',
          accent: '#E50914',
          room: {
            available: '#2B384E',
            vip: '#F59E0B',
            holding: '#EF4444',
            selected: '#10B981',
            reserved: '#4B5563',
          }
        }
      }
    },
  },
  plugins: [],
}
