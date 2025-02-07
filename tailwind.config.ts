import tailwindcssAnimate from "tailwindcss-animate";
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        champagne: "#F9DCC4",
        rose: {
          50: "#FFE9F1",
          100: "#FFCFE3",
          200: "#FFA7C8",
          300: "#FF7FAC",
          400: "#FF578F",
          500: "#FF2F73",
          600: "#E61B5E",
          700: "#B11548",
          800: "#800F33",
          900: "#4C0920",
        },
        burgundy: {
          50: "#FDE6E9",
          100: "#F9BCC6",
          200: "#F28B97",
          300: "#EC5B68",
          400: "#E6333F",
          500: "#D10C20",
          600: "#A10918",
          700: "#740613",
          800: "#47030B",
          900: "#230205",
        },
        cream: "#FFF4E6",
        background: "#FFF5F8",
        foreground: "#660029",
        border: "#E61B5E",
        input: "#FFD1E4",
        ring: "#FF578F",
        primary: {
          DEFAULT: "#FF2F73",
          foreground: "#FFF5F8",
        },
        secondary: {
          DEFAULT: "#FF8CB7",
          foreground: "#4C0920",
        },
        destructive: {
          DEFAULT: "#D10C20",
          foreground: "#FFE9F1",
        },
        muted: {
          DEFAULT: "#FFD1E4",
          foreground: "#4C0920",
        },
        accent: {
          DEFAULT: "#FF609C",
          foreground: "#FFF5F8",
        },
        popover: {
          DEFAULT: "#FFF0F5",
          foreground: "#4C0920",
        },
        card: {
          DEFAULT: "#FFF8FA",
          foreground: "#800F33",
        },
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
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        shine: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.5s ease-out",
        slideIn: "slideIn 0.3s ease-out",
        shine: "shine 2s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
