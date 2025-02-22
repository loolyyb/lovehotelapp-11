
import * as React from "react";
import { createContext, useContext, useState, useMemo } from "react";
import { type CustomTheme, ThemeName } from "@/types/theme";
import { themes } from "@/config/themes.config";

interface ThemeContextType {
  theme: CustomTheme;
  currentThemeName: ThemeName;
  updateTheme: (newTheme: Partial<CustomTheme>) => void;
  switchTheme: (themeName: ThemeName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialiser directement avec le thème lover-rose
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>("lover-rose");
  const [theme, setTheme] = useState<CustomTheme>(themes["lover-rose"]);

  const updateTheme = (newTheme: Partial<CustomTheme>) => {
    setTheme((current) => ({
      ...current,
      ...newTheme,
      version: incrementVersion(current.version),
    }));
  };

  const switchTheme = async (themeName: ThemeName) => {
    // Pour s'assurer que le thème lover-rose reste toujours actif
    if (themeName !== "lover-rose") {
      console.warn("Le thème lover-rose est le seul thème autorisé");
      return;
    }
    
    if (!themes[themeName]) {
      throw new Error(`Theme "${themeName}" not found`);
    }
    setCurrentThemeName(themeName);
    setTheme(themes[themeName]);
  };

  const value = useMemo(
    () => ({
      theme,
      currentThemeName,
      updateTheme,
      switchTheme,
    }),
    [theme, currentThemeName]
  );

  return (
    <ThemeContext.Provider value={value}>
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
