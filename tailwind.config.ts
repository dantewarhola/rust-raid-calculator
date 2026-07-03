import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rust industrial palette
        pit: "#0d0d0d",        // page background
        slab: "#1a1a1a",       // panel background
        scrap: "#242220",      // raised surfaces
        seam: "#3a3530",       // borders / dividers
        rust: {
          DEFAULT: "#ce422b",  // primary accent (Rust logo red-orange)
          deep: "#9c2f1e",
          glow: "#ff6a3d",
        },
        bone: "#d9d2c5",       // primary text (weathered off-white)
        ash: "#8c857a",        // secondary text
        sulfur: "#e8c33c",     // highlight for sulfur numbers
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-condensed)", "sans-serif"],
      },
      boxShadow: {
        panel: "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
