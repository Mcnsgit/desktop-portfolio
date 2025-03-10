// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Retro color palette
        "win95-blue": "#000080",
        "win95-gray": "#c0c0c0",
        "win95-dark": "#808080",
        "win95-light": "#ffffff",
      },
      boxShadow: {
        "win95-out":
          "inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf",
        "win95-in":
          "inset -1px -1px #ffffff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px #808080",
      },
    },
  },
  plugins: [],
};
