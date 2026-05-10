import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        ink: {
          50: "#f0f0ff",
          100: "#e4e3ff",
          200: "#cccbff",
          300: "#ada9ff",
          400: "#8b83ff",
          500: "#6d5dfc",
          600: "#5f3df7",
          700: "#512de3",
          800: "#4325b9",
          900: "#3a2193",
          950: "#22135c",
        },
        void: {
          50: "#f4f4ff",
          100: "#ebebff",
          200: "#d9d9ff",
          300: "#b8b7ff",
          400: "#9290fd",
          500: "#6f6cf9",
          600: "#5551f0",
          700: "#4743dc",
          800: "#3a37b8",
          900: "#323193",
          950: "#0a0914",
        },
        gold: {
          300: "#fde68a",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        surface: {
          0: "#07070f",
          1: "#0d0d1a",
          2: "#12122a",
          3: "#18183a",
          4: "#1e1e4a",
        },
      },
      animation: {
        "cell-pop": "cellPop 0.15s ease-out",
        "cell-error": "cellError 0.4s ease-in-out",
        "board-complete": "boardComplete 0.8s ease-out",
        "fade-up": "fadeUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.35s ease-out",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s linear infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        cellPop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        cellError: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-4px)" },
          "40%": { transform: "translateX(4px)" },
          "60%": { transform: "translateX(-3px)" },
          "80%": { transform: "translateX(3px)" },
        },
        boardComplete: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "60%": { opacity: "1", transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(251, 191, 36, 0)" },
          "50%": { boxShadow: "0 0 0 6px rgba(251, 191, 36, 0.15)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.12) 1px, transparent 0)",
        "hero-gradient":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(109,93,252,0.3) 0%, transparent 60%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "gold-shimmer":
          "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.15) 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
