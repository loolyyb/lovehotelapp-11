import React, { createContext, useContext, useState } from "react";
import { type ThemeName, type CustomTheme } from "@/types/theme";
import { themes } from "@/config/themes.config";

type ThemeContextType = {
  currentTheme: CustomTheme;
  currentThemeName: ThemeName;
  switchTheme: (themeName: ThemeName) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider component that manages the application's theme state
 * and provides theme switching functionality.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>("default");
  const [currentTheme, setCurrentTheme] = useState<CustomTheme>(themes.default);

  const switchTheme = async (themeName: ThemeName) => {
    try {
      if (!themes[themeName]) {
        throw new Error(`Theme "${themeName}" not found`);
      }

      setCurrentThemeName(themeName);
      setCurrentTheme(themes[themeName]);
    } catch (error) {
      console.error("[ThemeProvider] Error switching theme:", error);
      throw error;
    }
  };

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
}

/**
 * Custom hook to access the theme context.
 * Must be used within a ThemeProvider component.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}