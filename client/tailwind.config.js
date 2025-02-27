/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  darkMode: ["selector", '[data-mantine-color-scheme="dark"]'],
  theme: {
    extend: {},
  },
  plugins: [],
};
