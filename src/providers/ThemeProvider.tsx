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

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.lover);
  const [currentThemeName, setCurrentThemeName] = useState<string>("lover");

  const switchTheme = async (themeName: string) => {
    const newTheme = themes[themeName as keyof typeof themes];
    if (newTheme) {
      setCurrentTheme(newTheme);
      setCurrentThemeName(themeName);
    }
  };

  useEffect(() => {
    // Initialize with default theme
    switchTheme("lover");
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        currentThemeName,
        switchTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};