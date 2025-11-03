// mobile/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontSize: {
        base: 16,
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
