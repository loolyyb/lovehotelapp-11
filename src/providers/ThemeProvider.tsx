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
  console.log('[ThemeProvider] Initializing...');
  
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.lover);
  const [currentThemeName, setCurrentThemeName] = useState<string>("lover");

  const switchTheme = async (themeName: string) => {
    console.log('[ThemeProvider] Switching theme to:', themeName);
    const newTheme = themes[themeName as keyof typeof themes];
    if (newTheme) {
      setCurrentTheme(newTheme);
      setCurrentThemeName(themeName);
    }
  };

  useEffect(() => {
    console.log('[ThemeProvider] Initial theme setup');
    switchTheme("lover");
  }, []);

  const value = {
    currentTheme,
    currentThemeName,
    switchTheme,
  };

  console.log('[ThemeProvider] Rendering with theme:', currentThemeName);

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