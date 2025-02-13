import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export type ProfileWithPreferences = {
  profile: Tables<"profiles">;
  preferences: Tables<"preferences"> | null;
};

export function useProfiles() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileWithPreferences[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      console.log("Début du chargement des profils...");
      setLoading(true);
      
      console.log("Envoi de la requête pour récupérer les profils...");
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) {
        console.error("Erreur lors de la récupération des profils:", profilesError);
        throw profilesError;
      }

      console.log("Profils bruts reçus:", profilesData);
      console.log("Nombre de profils récupérés:", profilesData?.length);

      if (!profilesData) {
        throw new Error("Aucun profil n'a été retourné");
      }

      // Log each profile's visibility for debugging
      profilesData.forEach(profile => {
        console.log(`Profile ${profile.id} - visibility: ${profile.visibility}, user_id: ${profile.user_id}`);
      });

      console.log("Envoi de la requête pour récupérer les préférences...");
      const { data: preferencesData, error: preferencesError } = await supabase
        .from("preferences")
        .select("*");

      if (preferencesError) {
        console.error("Erreur lors de la récupération des préférences:", preferencesError);
        throw preferencesError;
      }

      console.log("Préférences brutes reçues:", preferencesData);
      console.log("Nombre de préférences récupérées:", preferencesData?.length);

      const profilesWithPreferences = profilesData.map(profile => {
        const preferences = preferencesData?.find(pref => pref.user_id === profile.user_id) || null;
        console.log(`Association pour le profil ${profile.id}:`, { 
          profile_user_id: profile.user_id,
          found_preferences: preferences ? 'oui' : 'non',
          visibility: profile.visibility
        });
        return {
          profile,
          preferences
        };
      });

      console.log("Nombre total de profils avec préférences:", profilesWithPreferences.length);
      console.log("Profils finaux:", profilesWithPreferences);

      setProfiles(profilesWithPreferences);
    } catch (error: any) {
      console.error("Erreur complète:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les profils. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  return { profiles, loading };
}