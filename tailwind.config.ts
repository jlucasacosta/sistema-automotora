import type { Config } from "tailwindcss"

// Cada color es "rgb(var(--x) / <alpha-value>)": habilita bg-success/15 sin hardcodear.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./modules/**/*.{ts,tsx}",
    "./shell/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: token("primary"),
        accent: token("accent"),
        bg: token("bg"),
        surface: token("surface"),
        fg: token("fg"),
        muted: token("muted"),
        border: token("border"),
        subtle: token("subtle"),
        success: token("success"),
        warning: token("warning"),
        danger: token("danger"),
        info: token("info"),
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body: "var(--font-body)",
      },
    },
  },
  plugins: [],
} satisfies Config
