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
        gray: {
          50: "#F5F5F5",
          100: "#E0E0E0",
          200: "#C2C2C2",
          300: "#9E9E9E",
          400: "#757575",
          500: "#616161",
          600: "#E0E0E0",
          700: "#2C2C2C",  // Fond principal sombre
          800: "#1E1E1E",
          900: "#121212",
        },
        background: "#1E1E1E",  // Fond sombre
        foreground: "#EDEDED",  // Texte clair
        border: "#5A5A5A",  // Bordures discrètes
        input: "#2C2C2C",  // Fond des champs de saisie
        ring: "#FF69B4",  // Rose vif pour les surbrillances et focus
        primary: {
          DEFAULT: "#FF69B4",  // Rose vif comme couleur primaire
          foreground: "#1E1E1E",
        },
        secondary: {
          DEFAULT: "#FF4893",  // Rose foncé intense pour les éléments secondaires
          100: "#FFDDEB",  // Tons pastel pour variantes
          200: "#FF99C5",
          300: "#FF66A3",
          foreground: "#1E1E1E",
        },
        destructive: {
          DEFAULT: "#FF3B62",  // Rouge vif
          foreground: "#1E1E1E",
        },
        muted: {
          DEFAULT: "#4A4A4A",  // Fond neutre pour éléments discrets
          foreground: "#D4D4D4",
        },
        accent: {
          DEFAULT: "#E61E8A",  // Fuchsia très accentué pour attirer l’attention
          100: "#FFD6F1",
          200: "#FF8ED6",
          300: "#E61E8A",  // Accent principal
          foreground: "#1E1E1E",
        },
        popover: {
          DEFAULT: "#2F2F2F",  // Fond sombre des popups
          foreground: "#EDEDED",
        },
        card: {
          DEFAULT: "#292929",  // Fond des cartes en gris sombre
          foreground: "#EDEDED",
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
