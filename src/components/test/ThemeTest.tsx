import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";

export const ThemeTest = () => {
  const { currentTheme, currentThemeName, switchTheme } = useTheme();

  console.log("ThemeTest rendering with:", {
    currentTheme,
    currentThemeName
  });

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Theme Test Component</h1>
      
      <div className="space-y-2">
        <p>Current Theme: {currentThemeName}</p>
        <p>Theme Object: {JSON.stringify(currentTheme, null, 2)}</p>
      </div>

      <div className="space-x-4">
        <Button onClick={() => switchTheme("default")}>
          Switch to Default
        </Button>
        <Button onClick={() => switchTheme("lover")}>
          Switch to Lover
        </Button>
      </div>
    </div>
  );
};