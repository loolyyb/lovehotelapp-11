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
        champagne: "#FDE8D7",
        rose: {
          50: "#FFF5F8",
          100: "#FFDDE5",
          200: "#FFBFD2",
          300: "#FF92B3",
          400: "#FF6B96",
          500: "#FF4E83",
          600: "#E0356C",
          700: "#B22756",
          800: "#861941",
          900: "#550F2C",
        },
        peach: {
          50: "#FFF1E8",
          100: "#FFE0CC",
          200: "#FFBF99",
          300: "#FF9966",
          400: "#FF7540",
          500: "#FF5B29",
          600: "#E0491F",
          700: "#B43818",
          800: "#882810",
          900: "#55180A",
        },
        cream: "#FFF8ED",
        background: "#FFF5F0",
        foreground: "#4C0B1A",
        border: "#FF4E83",
        input: "#FFE3EB",
        ring: "#FF6B96",
        primary: {
          DEFAULT: "#FF4E83",
          foreground: "#FFF8ED",
        },
        secondary: {
          DEFAULT: "#FF8F98",
          foreground: "#4C0B1A",
        },
        destructive: {
          DEFAULT: "#FF2E5E",
          foreground: "#FFF5F8",
        },
        muted: {
          DEFAULT: "#FFDEE6",
          foreground: "#4C0B1A",
        },
        accent: {
          DEFAULT: "#FF7260",
          foreground: "#FFF5F8",
        },
        popover: {
          DEFAULT: "#FFE4E8",
          foreground: "#4C0B1A",
        },
        card: {
          DEFAULT: "#FFF1F3",
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
