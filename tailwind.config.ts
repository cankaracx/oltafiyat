import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold: { 50: "#fff9e6", 100: "#ffefb8", 300: "#f6cd55", 500: "#c99a13", 700: "#8a6508" },
        ink: "#0b0b0c"
      },
      boxShadow: { premium: "0 24px 80px rgba(0,0,0,0.12)" }
    }
  },
  plugins: []
};

export default config;