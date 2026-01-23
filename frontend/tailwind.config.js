/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB", // A nice Fitness Blue
        secondary: "#1E293B", // Dark Slate
        accent: "#F59E0B", // Energy Orange
      }
    },
  },
  plugins: [],
}