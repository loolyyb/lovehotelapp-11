
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LocationType } from "@/components/matching/filters/LocationFilter";

export type InterestType = "all" | "casual" | "serious" | "libertine" | "bdsm" | "exhibitionist" | "open_curtains" | "speed_dating";
export type StatusType = "all" | "single_man" | "married_man" | "single_woman" | "married_woman" | "couple_mf" | "couple_mm" | "couple_ff";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  description: string;
  compatibility_score?: number;
  relationship_type: string[];
  sexual_orientation: string;
  status: StatusType | null;
  is_loolyb_holder: boolean;
}

export interface UserPreferences {
  open_curtains_interest: boolean;
  speed_dating_interest: boolean;
  libertine_party_interest: boolean;
  location: LocationType;
}

interface UseMatchingProfilesProps {
  selectedInterest: InterestType;
  searchTerm: string;
  status: StatusType;
  orientation: string;
  membershipTypes: string[];
  openCurtains: boolean;
}

export const useMatchingProfiles = ({
  selectedInterest,
  searchTerm,
  status,
  orientation,
  membershipTypes,
  openCurtains
}: UseMatchingProfilesProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const calculateCompatibilityScore = (
    profile: Profile,
    preferences: UserPreferences | null
  ): number => {
    if (!preferences) return 0;

    let score = 0;
    let total = 0;

    // Score basé sur le type de relation
    if (profile.relationship_type && selectedInterest !== 'all') {
      score += profile.relationship_type.includes(selectedInterest) ? 30 : 0;
      total += 30;
    }

    // Score basé sur les préférences des rideaux ouverts
    if (openCurtains && preferences.open_curtains_interest) {
      score += 20;
    }
    total += 20;

    // Score basé sur les intérêts de speed dating
    if (preferences.speed_dating_interest) {
      score += 15;
    }
    total += 15;

    // Score basé sur les intérêts libertins
    if (preferences.libertine_party_interest) {
      score += 15;
    }
    total += 15;

    return total > 0 ? Math.round((score / total) * 100) : 0;
  };

  const fetchProfiles = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      console.log('Fetching profiles with filters:', {
        selectedInterest,
        searchTerm,
        status,
        orientation,
        membershipTypes,
        openCurtains
      });

      let query = supabase
        .from("profiles")
        .select("*")
        .neq("user_id", session.user.id);

      // Appliquer les filtres
      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (orientation !== "") {
        query = query.eq("sexual_orientation", orientation);
      }

      if (membershipTypes.includes("loolyb")) {
        query = query.eq("is_loolyb_holder", true);
      }

      // Récupérer les profils
      const { data: profilesData, error: profilesError } = await query;

      if (profilesError) throw profilesError;

      // Récupérer les préférences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from("preferences")
        .select("*");

      if (preferencesError) throw preferencesError;

      const preferencesMap = new Map(
        preferencesData.map(pref => [pref.user_id, pref])
      );

      // Filtrer et trier les profils
      let compatibleProfiles = profilesData
        .filter((profile: Profile) => {
          // Filtre de recherche textuelle
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
              profile.full_name?.toLowerCase().includes(searchLower) ||
              profile.bio?.toLowerCase().includes(searchLower) ||
              profile.description?.toLowerCase().includes(searchLower)
            );
          }
          return true;
        })
        .filter((profile: Profile) => {
          // Filtre de type de relation
          if (selectedInterest !== "all") {
            return profile.relationship_type?.includes(selectedInterest);
          }
          return true;
        })
        .map((profile: Profile) => {
          const preferences = preferencesMap.get(profile.user_id) as UserPreferences;
          return {
            ...profile,
            compatibility_score: calculateCompatibilityScore(profile, preferences)
          };
        });

      // Trier par score de compatibilité
      compatibleProfiles.sort((a, b) => 
        (b.compatibility_score || 0) - (a.compatibility_score || 0)
      );

      console.log('Filtered profiles:', compatibleProfiles.length);
      setProfiles(compatibleProfiles);
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les profils compatibles.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [selectedInterest, searchTerm, status, orientation, membershipTypes, openCurtains]);

  return { profiles, loading };
};
