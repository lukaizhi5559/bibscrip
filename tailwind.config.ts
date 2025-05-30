import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem", // Adjusted padding for mobile-first
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Sidebar specific colors - will be defined via CSS variables
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
          accent: {
            DEFAULT: "hsl(var(--sidebar-accent))",
            foreground: "hsl(var(--sidebar-accent-foreground))",
          },
        },
      },
      borderRadius: {
        lg: "0.75rem", // Slightly more rounded
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "typing-dot-bounce": {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1.0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "typing-dot-bounce": "typing-dot-bounce 1.4s infinite ease-in-out both",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0, 0, 0, 0.05)",
        "soft-md": "0 6px 16px rgba(0, 0, 0, 0.07)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    ({ addBase }: any) => {
      addBase({
        ":root": {
          "--background": "40 30% 96%",
          "--foreground": "220 25% 30%",
          "--card": "0 0% 100%",
          "--card-foreground": "220 25% 30%",
          "--popover": "0 0% 100%",
          "--popover-foreground": "220 25% 30%",
          "--primary": "40 90% 55%",
          "--primary-foreground": "220 25% 15%",
          "--secondary": "220 15% 94%",
          "--secondary-foreground": "220 25% 30%",
          "--muted": "220 15% 94%",
          "--muted-foreground": "220 20% 50%",
          "--accent": "220 15% 90%",
          "--accent-foreground": "220 25% 20%",
          "--destructive": "0 84.2% 60.2%",
          "--destructive-foreground": "0 0% 98%",
          "--border": "220 20% 88%",
          "--input": "220 20% 92%",
          "--ring": "40 90% 55%",
          "--radius": "0.75rem",
          // Sidebar variables - Light Theme
          "--sidebar-background": "40 30% 97%", // Slightly off-white/beige
          "--sidebar-foreground": "220 25% 25%", // Soft Navy
          "--sidebar-border": "220 20% 85%",
          "--sidebar-ring": "40 90% 55%", // Golden accent for ring
          "--sidebar-accent": "40 50% 90%", // Lighter beige/gold for accent
          "--sidebar-accent-foreground": "220 25% 20%",
        },
        ".dark": {
          "--background": "220 25% 15%",
          "--foreground": "40 30% 92%",
          "--card": "220 25% 20%",
          "--card-foreground": "40 30% 92%",
          "--popover": "220 25% 15%",
          "--popover-foreground": "40 30% 92%",
          "--primary": "40 80% 60%",
          "--primary-foreground": "220 25% 10%",
          "--secondary": "220 20% 25%",
          "--secondary-foreground": "40 30% 92%",
          "--muted": "220 20% 25%",
          "--muted-foreground": "220 15% 70%",
          "--accent": "220 20% 30%",
          "--accent-foreground": "40 30% 92%",
          "--destructive": "0 62.8% 30.6%",
          "--destructive-foreground": "0 0% 98%",
          "--border": "220 20% 30%",
          "--input": "220 20% 28%",
          "--ring": "40 80% 60%",
          // Sidebar variables - Dark Theme
          "--sidebar-background": "220 25% 18%", // Darker Navy
          "--sidebar-foreground": "40 30% 88%", // Light Beige/Off-white
          "--sidebar-border": "220 20% 28%",
          "--sidebar-ring": "40 80% 60%", // Golden accent for ring
          "--sidebar-accent": "220 20% 25%", // Darker accent
          "--sidebar-accent-foreground": "40 30% 90%",
        },
      })
    },
  ],
} satisfies Config

export default config
