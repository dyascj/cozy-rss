import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core semantic colors from CSS variables
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        "muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-foreground": "rgb(var(--accent-foreground) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        "sidebar-bg": "rgb(var(--sidebar-bg) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        "card-foreground": "rgb(var(--card-foreground) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        destructive: "rgb(var(--destructive) / <alpha-value>)",

        // Anthropic-inspired named colors for direct use
        cream: {
          50: "#fefdfb",
          100: "#fdfcf7",
          200: "#faf9f0",
          300: "#f5f3ea",
          400: "#ebe8db",
          500: "#dddac9",
          600: "#c5c2b1",
          700: "#a19e8f",
          800: "#87857a",
          900: "#6b6a62",
        },
        charcoal: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#131314",
          950: "#0a0a0b",
        },
        sage: {
          50: "#f4f7f3",
          100: "#e6ede4",
          200: "#cddbc9",
          300: "#a8c3a1",
          400: "#829f7b",
          500: "#5f825a",
          600: "#4a6846",
          700: "#3c5339",
          800: "#32442f",
          900: "#2a3928",
          950: "#141e13",
        },
        taupe: {
          50: "#f7f6f5",
          100: "#edebe9",
          200: "#dbd8d4",
          300: "#c4c0ba",
          400: "#a9a49c",
          500: "#87867f",
          600: "#7a7972",
          700: "#666560",
          800: "#565550",
          900: "#4a4945",
          950: "#272624",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-spectral)",
          "Spectral",
          "Georgia",
          "Cambria",
          "serif",
        ],
        serif: [
          "var(--font-spectral)",
          "Spectral",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "Times",
          "serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "soft": "0 2px 8px rgb(19 19 20 / 0.06)",
        "soft-lg": "0 4px 12px rgb(19 19 20 / 0.08)",
        "warm": "0 2px 8px rgb(130 159 123 / 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
