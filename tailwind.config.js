/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#09090D",
        midnight: "#151219",
        crimson: "#9E092B",
        amethyst: "#4B176D",
        violet: "#A855F7",
        emerald: "#086B50",
        silver: "#BFC0CC",
        ivory: "#F2EDF5",
      },
      fontFamily: {
        serif: ["Cinzel", "Playfair Display", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
