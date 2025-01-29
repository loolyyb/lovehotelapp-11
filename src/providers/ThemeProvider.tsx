import React, { createContext, useContext, useCallback, useMemo } from "react";
import { ThemeName } from "@/types/theme";

interface ThemeContextType {
  currentThemeName: ThemeName;
  switchTheme: (theme: ThemeName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  currentThemeName: "default",
  switchTheme: async () => {},
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentThemeName, setCurrentThemeName] = React.useState<ThemeName>("default");

  const switchTheme = useCallback(async (theme: ThemeName) => {
    setCurrentThemeName(theme);
  }, []);

  const value = useMemo(
    () => ({
      currentThemeName,
      switchTheme,
    }),
    [currentThemeName, switchTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}