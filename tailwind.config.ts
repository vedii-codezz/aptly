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
        background: "var(--color-bg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          elevated: "var(--color-surface-elevated)",
          muted: "var(--color-surface-muted)",
          active: "var(--color-surface-active)",
        },
        ink: {
          DEFAULT: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          ghost: "var(--color-text-ghost)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
          subtle: "var(--color-border-subtle)",
        },
        aptly: {
          accent: {
            DEFAULT: "#2457FF",
            soft: "#E8EDFF",
          },
          match: {
            DEFAULT: "#16835D",
            bg: "#F0FDF4",
            border: "#BBF7D0",
          },
          partial: {
            DEFAULT: "#B76A00",
            bg: "#FFFBEB",
            border: "#FDE68A",
          },
          fail: {
            DEFAULT: "#C63C45",
            bg: "#FEF2F2",
            border: "#FECACA",
          },
          unknown: {
            DEFAULT: "#747B88",
            bg: "#F8FAFC",
            border: "#D8DCE3",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["SF Mono", "Menlo", "Monaco", "Consolas", "monospace"],
        editorial: ["var(--font-newsreader)", "Georgia", "Times New Roman", "serif"],
      },
      fontSize: {
        // Display scale — editorial moments
        "display-xl": ["clamp(3rem, 8vw, 7rem)", { lineHeight: "0.92", letterSpacing: "-0.04em", fontWeight: "800" }],
        "display-lg": ["clamp(2.25rem, 5vw, 4.5rem)", { lineHeight: "0.95", letterSpacing: "-0.03em", fontWeight: "800" }],
        "display-md": ["clamp(1.75rem, 3.5vw, 3rem)", { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "700" }],
        // System scale — small technical labels
        "system-xs": ["0.625rem", { lineHeight: "1", letterSpacing: "0.08em", fontWeight: "700" }],
        "system-sm": ["0.6875rem", { lineHeight: "1.2", letterSpacing: "0.06em", fontWeight: "600" }],
      },
      borderRadius: {
        window: "6px",
        control: "4px",
        pill: "9999px",
      },
      boxShadow: {
        "window": "0 8px 30px -8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
        "window-active": "0 12px 40px -8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08)",
        "dock": "0 8px 24px -4px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)",
        "subtle": "0 1px 3px rgba(0,0,0,0.03)",
        "command": "0 16px 48px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)",
      },
      transitionDuration: {
        "micro": "150ms",
        "ui": "250ms",
        "transition": "800ms",
      },
      keyframes: {
        "aptly-window-open": {
          "0%": { opacity: "0", transform: "scale(0.98) translateY(4px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "aptly-fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "aptly-slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "window-open": "aptly-window-open 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "aptly-fade-in 200ms ease-out forwards",
        "slide-up": "aptly-slide-up 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
