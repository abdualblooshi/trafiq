/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./views/**/*.{html,js}",
    "./src/**/*.{html,js}",
    "./index.html", // Add this if your index.html is in root
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
