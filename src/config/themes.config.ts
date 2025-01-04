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
      primary: "hsl(270 60% 50%)", // Vivid Purple (#8B5CF6)
      secondary: "hsl(300 90% 60%)", // Magenta Pink (#D946EF)
      accent: "hsl(260 40% 54%)", // Secondary Purple (#7E69AB)
      background: "hsl(251 100% 97%)", // Soft Purple (#E5DEFF)
      text: "hsl(230 24% 14%)", // Dark Purple (#1A1F2C)
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