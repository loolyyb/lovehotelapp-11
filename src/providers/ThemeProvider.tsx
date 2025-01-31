import * as React from "react";
import { type ThemeName } from "@/types/theme";

type ThemeContextType = {
  currentTheme: { name: string } | null;
  currentThemeName: string;
  switchTheme: (themeName: ThemeName) => Promise<void>;
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = React.useState<{ name: string } | null>(null);
  const [currentThemeName, setCurrentThemeName] = React.useState<string>("default");

  const switchTheme = async (themeName: ThemeName) => {
    try {
      setCurrentThemeName(themeName);
      setCurrentTheme({ name: themeName });
      console.log("Theme switched to:", themeName);
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

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}