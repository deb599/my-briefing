/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'Courier New'", "Courier", "monospace"],
      },
      colors: {
        teal: { 400: "#2dd4bf", 500: "#14b8a6" },
      },
    },
  },
  plugins: [],
};
