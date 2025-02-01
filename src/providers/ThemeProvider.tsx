import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
console.log("React import check:", {
  React,
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo
});

import { type ThemeName } from "@/types/theme";

type ThemeContextType = {
  currentTheme: { name: string } | null;
  currentThemeName: string;
  switchTheme: (themeName: ThemeName) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  console.log("ThemeProvider rendering, React hooks available:", {
    useState: typeof useState === 'function',
    useCallback: typeof useCallback === 'function',
    useMemo: typeof useMemo === 'function'
  });

  const [currentTheme, setCurrentTheme] = useState<{ name: string } | null>(null);
  const [currentThemeName, setCurrentThemeName] = useState<string>("default");

  const switchTheme = useCallback(async (themeName: ThemeName) => {
    try {
      console.log("Switching theme to:", themeName);
      setCurrentThemeName(themeName);
      setCurrentTheme({ name: themeName });
    } catch (error) {
      console.error("[ThemeProvider] Error switching theme:", error);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    currentTheme,
    currentThemeName,
    switchTheme,
  }), [currentTheme, currentThemeName, switchTheme]);

  console.log("ThemeProvider value:", value);

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