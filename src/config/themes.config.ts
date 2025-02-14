
import { CustomTheme } from "@/types/theme";

export const themes: Record<string, CustomTheme> = {
  default: {
    name: "default",
    version: "1.0.0",
    colors: {
      primary: "hsl(346 33% 33%)",
      secondary: "hsl(210 40% 96.1%)",
      accent: "hsl(210 40% 96.1%)",
      background: "hsl(0 0% 100%)",
      text: "hsl(222.2 84% 4.9%)",
      statusBar: "#561435",
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
  lover: {
    name: "lover",
    version: "1.0.0",
    colors: {
      primary: "hsl(270 60% 50%)",
      secondary: "hsl(300 90% 60%)",
      accent: "hsl(260 40% 54%)",
      background: "hsl(251 100% 97%)",
      text: "hsl(230 24% 14%)",
      statusBar: "#561435",
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
