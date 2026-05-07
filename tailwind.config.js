/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101315",
        paper: "#f6f1e6",
        brass: "#b07a1f",
        mint: "#4eb89a",
        berry: "#a33b67",
        cobalt: "#265a9c",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
