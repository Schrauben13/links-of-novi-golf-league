import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        fairway: {
          50: "#f0f7f0",
          100: "#dcebdc",
          200: "#b9d7ba",
          300: "#8fbd91",
          400: "#5f9c63",
          500: "#3f7d43",
          600: "#2f6333",
          700: "#264f2a",
          800: "#1f3f23",
          900: "#15291a",
          950: "#0b160d",
        },
        cream: {
          50: "#fefefc",
          100: "#faf9f3",
          200: "#f3f1e6",
        },
        accent: {
          DEFAULT: "#d4a017",
          light: "#e6bb3f",
          dark: "#a97e0f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
