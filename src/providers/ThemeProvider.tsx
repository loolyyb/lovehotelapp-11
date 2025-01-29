import React from "react";
import { ThemeName } from "@/types/theme";

interface ThemeContextType {
  currentThemeName: ThemeName;
  switchTheme: (theme: ThemeName) => Promise<void>;
}

const ThemeContext = React.createContext<ThemeContextType>({
  currentThemeName: "default",
  switchTheme: async () => {},
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentThemeName, setCurrentThemeName] = React.useState<ThemeName>("default");

  const switchTheme = async (theme: ThemeName) => {
    setCurrentThemeName(theme);
  };

  const value = React.useMemo(
    () => ({
      currentThemeName,
      switchTheme,
    }),
    [currentThemeName]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}