import React, { createContext, useContext, useState, useEffect } from "react";
import { themes } from "@/config/themes.config";

type Theme = {
  name: string;
  colors: Record<string, string>;
};

type ThemeContextType = {
  currentTheme: Theme;
  currentThemeName: string;
  switchTheme: (themeName: string) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.lover);
  const [currentThemeName, setCurrentThemeName] = useState<string>("lover");

  const switchTheme = async (themeName: string) => {
    if (themes[themeName]) {
      setCurrentTheme(themes[themeName]);
      setCurrentThemeName(themeName);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentThemeName);
  }, [currentThemeName]);

  const value = {
    currentTheme,
    currentThemeName,
    switchTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};