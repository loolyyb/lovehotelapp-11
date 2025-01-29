import * as React from "react";
import { ThemeName } from "@/types/theme";

interface ThemeContextType {
  currentThemeName: ThemeName;
  switchTheme: (theme: ThemeName) => Promise<void>;
}

// Create theme context with proper typing
const ThemeContext = React.createContext<ThemeContextType>({
  currentThemeName: "default",
  switchTheme: async () => {},
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Provider component
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentThemeName, setCurrentThemeName] = React.useState<ThemeName>("default");

  const switchTheme = async (theme: ThemeName) => {
    setCurrentThemeName(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentThemeName, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme
export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}