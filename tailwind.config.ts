import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fef9f0",
          100: "#fdf2dd",
          200: "#fbe5bb",
          300: "#f8d799",
          400: "#f5c977",
          500: "#d4a259",
          600: "#c68f47",
          700: "#a8743c",
          800: "#8a5930",
          900: "#6c4424",
        },
        emerald: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#134e4a",
        },
      },
      zIndex: {
        "200": "200",
      },
    },
  },
  plugins: [],
};
export default config;
