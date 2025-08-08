import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0E14",
        surface: "#0F131A",
        accent: "#5E6AD2",
        muted: "#9AA4B2",
        border: "#1C212B"
      }
    }
  },
  plugins: []
};

export default config;
