
import { CustomTheme } from "@/types/theme";

export const themes: Record<string, CustomTheme> = {
  "lover-rose": {
    name: "lover-rose",
    version: "1.0.0",
    colors: {
      primary: "#CE0067",      // Rose principal (boutons, actions principales)
      secondary: "#F3EBAD",    // Beige doré (textes actifs, accents)
      accent: "#40192C",       // Bordeaux foncé (fonds principaux)
      background: "#2A2726",   // Gris foncé (barre de navigation)
      text: "#FFFFFF",         // Blanc (texte principal)
    },
    fonts: {
      heading: "'Cormorant Garamond', serif",
      body: "'Montserrat', sans-serif",
    },
    spacing: {
      headerHeight: "4.5rem",
      mobileNavHeight: "4rem",
    },
    breakpoints: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
  },
} as const;

// Validation des valeurs du thème pour empêcher les modifications accidentelles
Object.freeze(themes["lover-rose"]);
Object.freeze(themes["lover-rose"].colors);
Object.freeze(themes["lover-rose"].fonts);
Object.freeze(themes["lover-rose"].spacing);
Object.freeze(themes["lover-rose"].breakpoints);
