import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#153227",
        moss: "#1f7a5d",
        mist: "#eef2eb",
        sand: "#f8f4ed",
        coral: "#d4885a",
        amber: "#c8912d"
      },
      backgroundImage: {
        halo:
          "radial-gradient(circle at top left, rgba(191, 219, 205, 0.55), transparent 40%), radial-gradient(circle at 80% 20%, rgba(252, 226, 208, 0.55), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.94), rgba(244,247,241,0.98))"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(21, 50, 39, 0.08)",
        card: "0 12px 32px rgba(21, 50, 39, 0.06)"
      },
      borderRadius: {
        xl2: "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;
