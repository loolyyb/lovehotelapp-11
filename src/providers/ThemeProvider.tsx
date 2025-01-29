import * as React from "react";
import { ThemeName } from "@/types/theme";

interface ThemeContextType {
  currentThemeName: ThemeName;
  switchTheme: (theme: ThemeName) => Promise<void>;
}

const ThemeContext = React.createContext<ThemeContextType>({
  currentThemeName: "default",
  switchTheme: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeName, setCurrentThemeName] = React.useState<ThemeName>("default");

  const switchTheme = React.useCallback(async (theme: ThemeName) => {
    setCurrentThemeName(theme);
  }, []);

  const value = React.useMemo(
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
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}