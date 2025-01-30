import React, { createContext, useContext, useState } from "react";
import { CustomTheme, ThemeName } from "@/types/theme";
import { themes } from "@/config/themes.config";

type ThemeContextType = {
  currentTheme: CustomTheme;
  currentThemeName: ThemeName;
  switchTheme: (themeName: ThemeName) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<CustomTheme>(themes.lover);
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>("lover");

  if (!children) {
    console.error('ThemeProvider: children is null or undefined');
    return null;
  }

  const switchTheme = async (themeName: ThemeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themes[themeName]);
      setCurrentThemeName(themeName);
      document.documentElement.setAttribute("data-theme", themeName);
    }
  };

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