import React, { createContext, useContext, useState, useEffect } from "react";
import { type ThemeName } from "@/types/theme";

type ThemeContextType = {
  currentTheme: { name: string } | null;
  currentThemeName: string;
  switchTheme: (themeName: ThemeName) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<{ name: string } | null>(null);
  const [currentThemeName, setCurrentThemeName] = useState<string>('default');

  const switchTheme = async (themeName: ThemeName) => {
    try {
      setCurrentThemeName(themeName);
      setCurrentTheme({ name: themeName });
    } catch (error) {
      console.error('[ThemeProvider] Error switching theme:', error);
      throw error;
    }
  };

  useEffect(() => {
    const initTheme = async () => {
      try {
        await switchTheme('default');
      } catch (error) {
        console.error('[ThemeProvider] Error initializing theme:', error);
      }
    };

    initTheme();
  }, []);

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
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}