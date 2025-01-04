import React, { createContext, useContext, useState } from "react";
import { type CustomTheme } from "@/types/theme";

const defaultTheme: CustomTheme = {
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
};

interface ThemeContextType {
  theme: CustomTheme;
  updateTheme: (newTheme: Partial<CustomTheme>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<CustomTheme>(defaultTheme);

  const updateTheme = (newTheme: Partial<CustomTheme>) => {
    setTheme((current) => ({
      ...current,
      ...newTheme,
      version: incrementVersion(current.version),
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

function incrementVersion(version: string): string {
  const [major, minor, patch] = version.split(".").map(Number);
  return `${major}.${minor}.${patch + 1}`;
}