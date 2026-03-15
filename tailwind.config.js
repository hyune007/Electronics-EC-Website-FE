/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef5fb",
          100: "#d9e8f4",
          200: "#bad1e8",
          300: "#8fb2d5",
          400: "#5e8ec0",
          500: "#2f669c",
          600: "#0f3d69",
          700: "#0d355b",
          800: "#0a2a48",
          900: "#062033",
          950: "#031528",
          DEFAULT: "#0f3d69",
        },
        secondary: {
          50: "#edf4fa",
          100: "#d4e5f2",
          200: "#adcde5",
          300: "#80acd3",
          400: "#588ebf",
          500: "#3b74a9",
          600: "#245f8f",
          700: "#1a496f",
          800: "#12344f",
          900: "#0a2235",
          950: "#04131f",
          DEFAULT: "#062b4c",
        },
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
          DEFAULT: "#64748b",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          elevated: "var(--color-surface-elevated)",
        },
        border: {
          DEFAULT: "var(--color-border)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          text: "var(--color-text-muted)",
        },
        "navy-light": "#062b4c",
        "navy-dark": "#021526",
        "navy-deep": "#010d1c",
        "onyx-black": "#000a19",
        hover: "#003c75",
        success: "#1f8f61",
        warning: "#b7791f",
        danger: "#b63b3b",
        info: "#245f8f",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn var(--motion-fast) var(--ease-standard)",
        "slide-up": "slideUp var(--motion-base) var(--ease-standard)",
        "scale-in": "scaleIn var(--motion-fast) var(--ease-standard)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-default)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      transitionDuration: {
        160: "160ms",
        220: "220ms",
        320: "320ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
