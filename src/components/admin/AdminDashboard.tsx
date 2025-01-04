import React from "react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeName } from "@/types/theme";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useNavigate } from "react-router-dom";
import { AdvertisementManager } from "./AdvertisementManager";
import { Loader } from "lucide-react";

export function AdminDashboard() {
  const { currentThemeName, switchTheme } = useTheme();
  const { toast } = useToast();
  const { session } = useAuthSession();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!session) {
      navigate('/login');
      toast({
        title: "Accès refusé",
        description: "Vous devez être connecté pour accéder au tableau de bord administrateur.",
        variant: "destructive",
      });
    }
  }, [session, navigate, toast]);

  const handleThemeChange = async (themeName: ThemeName) => {
    if (!session) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour changer le thème.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update theme in UI
      await switchTheme(themeName);
      
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
        description: "Impossible de mettre à jour le thème. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-8">Tableau de bord administrateur</h1>
      
      {/* Theme Management Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Gestion des thèmes</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Thème actuel : {currentThemeName}</span>
            <div className="space-x-4">
              <Button
                onClick={() => handleThemeChange("default")}
                variant={currentThemeName === "default" ? "secondary" : "outline"}
                className="cursor-pointer hover:bg-secondary/80"
                disabled={isLoading}
              >
                {isLoading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                Thème par défaut
              </Button>
              <Button
                onClick={() => handleThemeChange("lover")}
                variant={currentThemeName === "lover" ? "secondary" : "outline"}
                className="cursor-pointer hover:bg-secondary/80"
                disabled={isLoading}
              >
                {isLoading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                Thème Lover
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Advertisement Management Section */}
      <AdvertisementManager session={session} />
    </div>
  );
}