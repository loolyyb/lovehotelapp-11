import React, { createContext, useContext, useState, useEffect } from "react";
import { themes } from "@/config/themes.config";
import { CustomTheme, ThemeName } from "@/types/theme";

type ThemeContextType = {
  currentTheme: CustomTheme;
  currentThemeName: ThemeName;
  switchTheme: (themeName: ThemeName) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<CustomTheme>(themes.lover);
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>("lover");

  const switchTheme = async (themeName: ThemeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themes[themeName]);
      setCurrentThemeName(themeName);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentThemeName);
  }, [currentThemeName]);

  const contextValue = {
    currentTheme,
    currentThemeName,
    switchTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
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