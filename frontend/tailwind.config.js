/** @type {import('tailwindcss').Config} */
module.exports = {
  // This tells Tailwind to enable dark mode based on a class
  darkMode: 'class',
  // This tells Tailwind where to look for class names
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}