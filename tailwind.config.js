/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        digital: ['"Orbitron"', 'sans-serif'], // estilo cronómetro
      },
    },
  },
  plugins: [],
}


