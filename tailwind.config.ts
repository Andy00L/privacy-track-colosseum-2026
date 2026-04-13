import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        shadow: {
          50: "#f0fdf6",
          100: "#d9fbe8",
          200: "#b5f5d1",
          300: "#7aebb0",
          400: "#3dd888",
          500: "#14be6a",
          600: "#099c54",
          700: "#0b7b45",
          800: "#0e6139",
          900: "#0d5031",
          950: "#022c19",
        },
        midnight: {
          50: "#f3f6fc",
          100: "#e5ecf9",
          200: "#c6d6f1",
          300: "#94b5e5",
          400: "#5b8ed5",
          500: "#3670c1",
          600: "#2658a3",
          700: "#1f4784",
          800: "#1e3d6e",
          900: "#1d355c",
          950: "#0b1526",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
