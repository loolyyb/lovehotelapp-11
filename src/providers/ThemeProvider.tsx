import React, { createContext, useContext, useState } from "react";
import { type ThemeName } from "@/types/theme";

type ThemeContextType = {
  currentTheme: { name: string } | null;
  currentThemeName: string;
  switchTheme: (themeName: ThemeName) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<{ name: string } | null>(null);
  const [currentThemeName, setCurrentThemeName] = useState<string>("default");

  const switchTheme = async (themeName: ThemeName) => {
    try {
      setCurrentThemeName(themeName);
      setCurrentTheme({ name: themeName });
    } catch (error) {
      console.error("[ThemeProvider] Error switching theme:", error);
      throw error;
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

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}