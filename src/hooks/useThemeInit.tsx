import { useEffect } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { useToast } from "./use-toast";
import { Session } from "@supabase/supabase-js";

export function useThemeInit(session: Session | null) {
  const { switchTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    const initTheme = async () => {
      if (!session) return;
      try {
        await switchTheme("lover");
      } catch (error) {
        console.error("Erreur lors du changement de thème:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le thème. Veuillez vous connecter et réessayer.",
          variant: "destructive",
        });
      }
    };

    initTheme();
  }, [session, switchTheme, toast]);
}