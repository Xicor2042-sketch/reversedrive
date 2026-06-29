import type { Config } from "tailwindcss";

/**
 * ReverseDrive Tailwind config (legacy compat).
 *
 * NOTE: This project uses Tailwind CSS v4, where the primary theme is
 * defined in CSS via `@theme` in app/globals.css. This file is kept for
 * IDE tooling / plugins that still look for a JS/TS config. Values here
 * mirror the CSS theme so they stay in sync.
 */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0d0f14",
          900: "#111827",
          800: "#1a1f2e",
          700: "#232a3d",
          600: "#2d3650",
          500: "#3b4463",
          400: "#525d7a",
          300: "#7b85a3",
          200: "#a8b1cc",
          100: "#d4d9e8",
        },
        glass: {
          DEFAULT: "#1a1f2e",
          light: "rgba(255,255,255,0.05)",
          border: "rgba(255,255,255,0.1)",
        },
        "neon-blue": {
          DEFAULT: "#3b82f6",
          light: "#60a5fa",
          dark: "#2563eb",
          foreground: "#ffffff",
        },
        cyan: {
          DEFAULT: "#06b6d4",
          light: "#22d3ee",
          dark: "#0891b2",
        },
        emerald: {
          DEFAULT: "#10b981",
          light: "#34d399",
          dark: "#059669",
        },
        amber: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
        },
        red: {
          DEFAULT: "#ef4444",
          light: "#f87171",
          dark: "#dc2626",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "var(--font-jetbrains-mono)",
          "ui-monospace",
          "monospace",
        ],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["1rem", { lineHeight: "1.5rem" }],
        base: ["1.25rem", { lineHeight: "1.75rem" }],
        lg: ["1.5rem", { lineHeight: "2rem" }],
        xl: ["2rem", { lineHeight: "2.25rem" }],
        "2xl": ["3rem", { lineHeight: "1" }],
      },
      backdropBlur: {
        glass: "12px",
      },
      animation: {
        "pulse-neon": "pulse-neon 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "radar-sweep": "radar-sweep 3s linear infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "slide-up": "slide-up 0.4s cubic-bezier(0.16,1,0.3,1)",
      },
      keyframes: {
        "pulse-neon": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 0 0 rgba(59,130,246,0.7)",
          },
          "50%": {
            opacity: "0.85",
            boxShadow: "0 0 0 8px rgba(59,130,246,0)",
          },
        },
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      maxWidth: {
        container: "1280px",
        "container-sm": "640px",
        "container-md": "768px",
        "container-lg": "1024px",
        "container-xl": "1280px",
      },
    },
  },
  plugins: [],
} satisfies Config;