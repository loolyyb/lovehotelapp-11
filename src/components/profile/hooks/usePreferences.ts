import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function usePreferences() {
  const [preferences, setPreferences] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    getPreferences();
  }, []);

  const getPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
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

  return { preferences, handlePreferenceChange };
}