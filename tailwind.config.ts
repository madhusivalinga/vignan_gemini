import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f172a",
        secondary: "#2563eb",
        accent: "#22d3ee",
        "background-soft": "#eff6ff",
        "background-gray": "#f3f4f6",
      },
    },
  },
  plugins: [],
};
export default config;
