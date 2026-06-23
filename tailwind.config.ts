import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        deepsea: {
          50: "#ecfeff",
          100: "#cffafe",
          500: "#0891b2",
          700: "#0e7490",
          900: "#164e63"
        },
        lure: "#f97316"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;