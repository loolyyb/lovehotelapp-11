import React, { createContext, useContext, useState } from "react";
import { type CustomTheme, ThemeName } from "@/types/theme";
import { themes } from "@/config/themes.config";
import { supabase } from "@/integrations/supabase/client";

interface ThemeContextType {
  theme: CustomTheme;
  currentThemeName: ThemeName;
  updateTheme: (newTheme: Partial<CustomTheme>) => void;
  switchTheme: (themeName: ThemeName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>("default");
  const [theme, setTheme] = useState<CustomTheme>(themes[currentThemeName]);

  const updateTheme = (newTheme: Partial<CustomTheme>) => {
    setTheme((current) => ({
      ...current,
      ...newTheme,
      version: incrementVersion(current.version),
    }));
  };

  const switchTheme = async (themeName: ThemeName) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Vous devez être connecté pour changer le thème");
    }

    if (!themes[themeName]) {
      throw new Error(`Le thème "${themeName}" n'existe pas`);
    }

    setCurrentThemeName(themeName);
    setTheme(themes[themeName]);
  };

  return (
    <ThemeContext.Provider value={{ theme, currentThemeName, updateTheme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme doit être utilisé à l'intérieur d'un ThemeProvider");
  }
  return context;
}

function incrementVersion(version: string): string {
  const [major, minor, patch] = version.split(".").map(Number);
  return `${major}.${minor}.${patch + 1}`;
}