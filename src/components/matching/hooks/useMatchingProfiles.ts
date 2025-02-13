
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

    if (profile.relationship_type) {
      score += profile.relationship_type.length * 20;
      total += profile.relationship_type.length * 20;
    }

    if (preferences.open_curtains_interest) {
      score += 15;
    }
    total += 15;

    if (preferences.speed_dating_interest) {
      score += 15;
    }
    total += 15;

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

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", session.user.id);

      if (profilesError) throw profilesError;

      const { data: preferencesData, error: preferencesError } = await supabase
        .from("preferences")
        .select("*");

      if (preferencesError) throw preferencesError;

      const preferencesMap = new Map(
        preferencesData.map(pref => [pref.user_id, pref])
      );

      let compatibleProfiles = profilesData.map((profile: Profile) => {
        const preferences = preferencesMap.get(profile.user_id) as UserPreferences;
        return {
          ...profile,
          compatibility_score: calculateCompatibilityScore(profile, preferences)
        };
      });

      if (status !== "all") {
        compatibleProfiles = compatibleProfiles.filter(
          profile => profile.status === status
        );
      }

      if (orientation !== "") {
        compatibleProfiles = compatibleProfiles.filter(
          profile => profile.sexual_orientation === orientation
        );
      }

      if (membershipTypes.includes("loolyb")) {
        compatibleProfiles = compatibleProfiles.filter(
          profile => profile.is_loolyb_holder
        );
      }

      compatibleProfiles.sort((a, b) => 
        (b.compatibility_score || 0) - (a.compatibility_score || 0)
      );

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
