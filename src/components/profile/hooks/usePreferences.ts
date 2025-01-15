import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function usePreferences() {
  const [preferences, setPreferences] = useState<any>(null);
  const { toast } = useToast();

  const getPreferences = async () => {
    try {
      console.log("Fetching preferences...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found");
        return;
      }

      const { data, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading preferences:', error);
        if (error.code === 'PGRST116') {
          const { data: newPreferences, error: createError } = await supabase
            .from('preferences')
            .insert([{
              user_id: user.id,
              open_curtains: false,
              open_curtains_interest: false,
              speed_dating_interest: false,
              libertine_party_interest: false,
              interests: []
            }])
            .select()
            .single();

          if (createError) throw createError;
          setPreferences(newPreferences);
          return;
        }

        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger vos préférences.",
        });
        return;
      }

      console.log("Preferences loaded:", data);
      setPreferences(data);
    } catch (error: any) {
      console.error('Error loading preferences:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos préférences.",
      });
    }
  };

  const handlePreferenceChange = async (updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Updating preferences with:", updates);
      const { error } = await supabase
        .from('preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          ...updates,
        });

      if (error) throw error;
      setPreferences((prev: any) => ({ ...prev, ...updates }));
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour vos préférences.",
      });
    }
  };

  useEffect(() => {
    getPreferences();
  }, []);

  return { preferences, handlePreferenceChange };
}