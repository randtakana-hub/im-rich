import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08080A",
          900: "#0D0D0F",
          800: "#111113",
          700: "#17171A",
          600: "#1D1D21",
        },
        gold: {
          300: "#F7D08A",
          400: "#F0B95A",
          500: "#D9A441",
          600: "#C88A2A",
          700: "#9C6C20",
        },
        wealth: {
          up: "#5FBE84",
          down: "#D9695F",
        },
        parchment: {
          100: "#F3F1EA",
          300: "#C9C6BE",
          500: "#8A8780",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(217,164,65,0.15), 0 12px 40px -12px rgba(217,164,65,0.25), 0 4px 16px -4px rgba(0,0,0,0.6)",
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 20px 60px -20px rgba(0,0,0,0.7)",
      },
      backgroundImage: {
        "gold-sheen": "linear-gradient(135deg, #F0B95A 0%, #D9A441 35%, #9C6C20 70%, #F7D08A 100%)",
        "radial-glow": "radial-gradient(circle at 50% 0%, rgba(217,164,65,0.16), transparent 60%)",
      },
      keyframes: {
        "coin-shine": {
          "0%, 100%": { transform: "translateX(-120%) rotate(20deg)" },
          "50%": { transform: "translateX(120%) rotate(20deg)" },
        },
        "coin-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "coin-shine": "coin-shine 3.2s ease-in-out infinite",
        "coin-float": "coin-float 5s ease-in-out infinite",
        "rise-in": "rise-in 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
