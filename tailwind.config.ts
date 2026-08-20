import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18202f",
        cloud: "#f6f8fb",
        line: "#dbe3ef",
        teal: "#0f9f9a",
        coral: "#f26b5e",
        amber: "#f2a93b",
        indigo: "#5368d5"
      },
      boxShadow: {
        soft: "0 16px 48px rgba(24, 32, 47, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
