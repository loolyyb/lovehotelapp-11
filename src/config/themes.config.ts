
import { CustomTheme } from "@/types/theme";

export const themes: Record<string, CustomTheme> = {
  "lover-rose": {
    name: "lover-rose",
    version: "1.0.0",
    colors: {
      primary: "hsl(270 60% 50%)",      // Violet principal
      secondary: "hsl(300 90% 60%)",     // Rose vif
      accent: "hsl(260 40% 54%)",        // Violet doux
      background: "hsl(251 100% 97%)",   // Fond légèrement lavande
      text: "hsl(230 24% 14%)",          // Gris foncé bleuté
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
};

