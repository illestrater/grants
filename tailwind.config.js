module.exports = {
  purge: {
    enabled: false,
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
  },
  darkMode: false,
  theme: {
    extend: {},
    minHeight: {
      "screen-90": "90vh",
      "screen-80": "80vh",
      "screen-70": "70vh",
      "screen-60": "60vh",
      "screen-50": "50vh",
      "screen-40": "40vh",
      "screen-30": "30vh",
      "screen-20": "20vh",
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
