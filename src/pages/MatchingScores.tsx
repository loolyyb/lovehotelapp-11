
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import { MatchingFilter } from "@/components/matching/MatchingFilter";
import { MatchingCard } from "@/components/matching/MatchingCard";

type InterestType = "all" | "casual" | "serious" | "libertine" | "bdsm" | "exhibitionist" | "open_curtains" | "speed_dating";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  compatibility_score?: number;
  relationship_type: string[];
  sexual_orientation: string;
}

interface Preferences {
  open_curtains_interest: boolean;
  speed_dating_interest: boolean;
  libertine_party_interest: boolean;
}

export default function MatchingScores() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterest, setSelectedInterest] = useState<InterestType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [orientation, setOrientation] = useState("");
  const [membershipTypes, setMembershipTypes] = useState<string[]>([]);
  const [openCurtains, setOpenCurtains] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
  }, [selectedInterest, searchTerm, location, status, orientation, membershipTypes, openCurtains]);

  const calculateCompatibilityScore = (
    userProfile: any,
    userPreferences: any,
    otherProfile: Profile,
    otherPreferences: Preferences
  ) => {
    let matchingPoints = 0;
    let totalPoints = 0;

    // Vérifier les types de relation
    if (userProfile.relationship_type && otherProfile.relationship_type) {
      const commonTypes = userProfile.relationship_type.filter((type: string) =>
        otherProfile.relationship_type.includes(type)
      );
      matchingPoints += commonTypes.length * 20;
      totalPoints += Math.max(userProfile.relationship_type.length, otherProfile.relationship_type.length) * 20;
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

    // Calculer le pourcentage de compatibilité
    return totalPoints > 0 ? Math.round((matchingPoints / totalPoints) * 100) : 0;
  };

  const fetchProfiles = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Récupérer le profil et les préférences de l'utilisateur connecté
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (profileError) throw profileError;

      const { data: userPreferences, error: preferencesError } = await supabase
        .from("preferences")
        .select("*")
        .eq("user_id", session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (preferencesError) throw preferencesError;

      // Construction de la requête avec les filtres
      let query = supabase
        .from("profiles")
        .select(`
          id,
          user_id,
          full_name,
          avatar_url,
          bio,
          relationship_type,
          sexual_orientation,
          status,
          is_loolyb_holder
        `)
        .neq("user_id", session.user.id);

      // Filtre de recherche
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
      }

      // Filtre de localisation
      if (location && location !== "all") {
        query = query.eq("location", location);
      }

      // Filtre de statut
      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      // Filtre d'orientation
      if (orientation && orientation !== "all") {
        query = query.eq("sexual_orientation", orientation);
      }

      // Filtre de type d'adhésion
      if (membershipTypes.includes("loolyb")) {
        query = query.eq("is_loolyb_holder", true);
      }

      const { data: otherProfiles, error: otherProfilesError } = await query;
      if (otherProfilesError) throw otherProfilesError;

      // Récupérer les préférences des autres profils
      const { data: otherPreferences, error: otherPreferencesError } = await supabase
        .from("preferences")
        .select("*")
        .order('created_at', { ascending: false });

      if (otherPreferencesError) throw otherPreferencesError;

      // Créer une map des préférences par user_id
      const preferencesMap = new Map();
      otherPreferences.forEach((pref) => {
        if (!preferencesMap.has(pref.user_id)) {
          preferencesMap.set(pref.user_id, pref);
        }
      });

      // Calculer les scores de compatibilité et appliquer les filtres
      let compatibleProfiles = otherProfiles.map((profile: Profile) => {
        const preferences = preferencesMap.get(profile.user_id);
        const score = calculateCompatibilityScore(
          userProfile,
          userPreferences,
          profile,
          preferences
        );

        return {
          ...profile,
          compatibility_score: score,
        };
      });

      // Filtre par intérêt sélectionné
      if (selectedInterest !== "all") {
        compatibleProfiles = compatibleProfiles.filter((profile: Profile) => {
          const preferences = preferencesMap.get(profile.user_id);
          
          if (selectedInterest === "open_curtains") {
            return preferences?.open_curtains_interest;
          }
          if (selectedInterest === "speed_dating") {
            return preferences?.speed_dating_interest;
          }
          if (selectedInterest === "libertine") {
            return preferences?.libertine_party_interest;
          }
          return profile.relationship_type?.includes(selectedInterest);
        });
      }

      // Filtre rideaux ouverts
      if (openCurtains) {
        compatibleProfiles = compatibleProfiles.filter((profile: Profile) => {
          const preferences = preferencesMap.get(profile.user_id);
          return preferences?.open_curtains_interest;
        });
      }

      // Trier par score de compatibilité
      compatibleProfiles.sort((a, b) => 
        (b.compatibility_score || 0) - (a.compatibility_score || 0)
      );

      console.log('Profiles filtrés:', compatibleProfiles);
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

  const handleMessageClick = (profileId: string) => {
    navigate(`/messages?profile=${profileId}`);
  };

  const handleProfileClick = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-champagne via-rose-50 to-cream flex items-center justify-center">
        <div className="animate-pulse text-burgundy">Chargement...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-champagne via-rose-50 to-cream">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-cormorant text-burgundy text-center mb-8 animate-fadeIn">
          Rencontres
        </h1>

        <div className="mb-12">
          <MatchingFilter 
            selectedInterest={selectedInterest}
            onInterestChange={setSelectedInterest}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            location={location}
            onLocationChange={setLocation}
            status={status}
            onStatusChange={setStatus}
            orientation={orientation}
            onOrientationChange={setOrientation}
            membershipTypes={membershipTypes}
            onMembershipTypesChange={setMembershipTypes}
            openCurtains={openCurtains}
            onOpenCurtainsChange={setOpenCurtains}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {profiles.map((profile, index) => (
            <MatchingCard
              key={profile.id}
              profile={profile}
              onProfileClick={handleProfileClick}
              onMessageClick={handleMessageClick}
              index={index}
            />
          ))}
        </div>

        {profiles.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-burgundy mx-auto mb-4" />
            <p className="text-lg text-burgundy">
              Aucun profil compatible trouvé pour le moment
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
