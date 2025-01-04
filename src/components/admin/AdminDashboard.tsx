import React from "react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeName } from "@/types/theme";

export function AdminDashboard() {
  const { currentThemeName, switchTheme } = useTheme();
  const { toast } = useToast();

  const handleThemeChange = async (themeName: ThemeName) => {
    try {
      // Update theme in UI
      switchTheme(themeName);
      
      // Update theme in database
      const { error } = await supabase
        .from('admin_settings')
        .update({ 
          value: { current: themeName, available: ["default", "lover"] },
          updated_at: new Date().toISOString()
        })
        .eq('key', 'theme');

      if (error) throw error;

      toast({
        title: "Thème mis à jour",
        description: `Le thème ${themeName} a été activé avec succès.`,
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le thème.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-8">Tableau de bord administrateur</h1>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Gestion des thèmes</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Thème actuel : {currentThemeName}</span>
            <div className="space-x-4">
              <Button
                onClick={() => handleThemeChange("default")}
                variant={currentThemeName === "default" ? "default" : "outline"}
                disabled={currentThemeName === "default"}
              >
                Thème par défaut
              </Button>
              <Button
                onClick={() => handleThemeChange("lover")}
                variant={currentThemeName === "lover" ? "default" : "outline"}
                disabled={currentThemeName === "lover"}
              >
                Thème Lover
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}