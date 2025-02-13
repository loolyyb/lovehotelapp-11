
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export type ProfileWithPreferences = {
  profile: Tables<"profiles">;
  preferences: Tables<"preferences"> | null;
  compatibility_score?: number;
};

export function useProfiles() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileWithPreferences[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const calculateCompatibilityScore = async (
    userProfile: Tables<"profiles">,
    userPreferences: Tables<"preferences"> | null,
    otherProfile: Tables<"profiles">,
    otherPreferences: Tables<"preferences"> | null
  ) => {
    let matchingPoints = 0;
    let totalPoints = 0;

    // Vérifier les types de relation
    if (userProfile.relationship_type && otherProfile.relationship_type) {
      const commonTypes = userProfile.relationship_type.filter((type) =>
        otherProfile.relationship_type?.includes(type)
      );
      matchingPoints += commonTypes.length * 20;
      totalPoints += Math.max(
        userProfile.relationship_type.length,
        otherProfile.relationship_type?.length || 0
      ) * 20;
    }

    // Vérifier les intérêts spécifiques
    if (userPreferences && otherPreferences) {
      // Rideaux ouverts
      if (userPreferences.open_curtains_interest === otherPreferences.open_curtains_interest) {
        matchingPoints += 15;
      }
      totalPoints += 15;

      // Speed dating
      if (userPreferences.speed_dating_interest === otherPreferences.speed_dating_interest) {
        matchingPoints += 15;
      }
      totalPoints += 15;

      // Soirées libertines
      if (userPreferences.libertine_party_interest === otherPreferences.libertine_party_interest) {
        matchingPoints += 15;
      }
      totalPoints += 15;
    }

    return totalPoints > 0 ? Math.round((matchingPoints / totalPoints) * 100) : 0;
  };

  const fetchProfiles = async () => {
    try {
      console.log("Début du chargement des profils...");
      setLoading(true);

      // Get current user's profile and preferences
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("No session found");
      }

      const { data: userProfile, error: userProfileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (userProfileError) throw userProfileError;

      const { data: userPreferences, error: userPreferencesError } = await supabase
        .from("preferences")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle(); // Changé de .single() à .maybeSingle()

      if (userPreferencesError) {
        throw userPreferencesError;
      }
      
      console.log("Envoi de la requête pour récupérer les profils...");
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", session.user.id);

      if (profilesError) {
        console.error("Erreur lors de la récupération des profils:", profilesError);
        throw profilesError;
      }

      console.log("Profils bruts reçus:", profilesData);
      console.log("Nombre de profils récupérés:", profilesData?.length);

      if (!profilesData) {
        throw new Error("Aucun profil n'a été retourné");
      }

      console.log("Envoi de la requête pour récupérer les préférences...");
      const { data: preferencesData, error: preferencesError } = await supabase
        .from("preferences")
        .select("*");

      if (preferencesError) {
        console.error("Erreur lors de la récupération des préférences:", preferencesError);
        throw preferencesError;
      }

      const profilesWithPreferences = await Promise.all(
        profilesData.map(async (profile) => {
          const preferences = preferencesData?.find(
            (pref) => pref.user_id === profile.user_id
          ) || null;

          const compatibilityScore = await calculateCompatibilityScore(
            userProfile,
            userPreferences || null,
            profile,
            preferences
          );

          return {
            profile,
            preferences,
            compatibility_score: compatibilityScore,
          };
        })
      );

      // Trier par score de compatibilité
      profilesWithPreferences.sort(
        (a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0)
      );

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
