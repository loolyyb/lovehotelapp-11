
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import { MatchingFilter } from "@/components/matching/MatchingFilter";
import { MatchingCard } from "@/components/matching/MatchingCard";
import { LocationType } from "@/components/matching/filters/LocationFilter";

type InterestType = "all" | "casual" | "serious" | "libertine" | "bdsm" | "exhibitionist" | "open_curtains" | "speed_dating";
type StatusType = "all" | "single_man" | "married_man" | "single_woman" | "married_woman" | "couple_mf" | "couple_mm" | "couple_ff";

interface Profile {
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

interface UserPreferences {
  open_curtains_interest: boolean;
  speed_dating_interest: boolean;
  libertine_party_interest: boolean;
  location: LocationType;
}

export default function MatchingScores() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterest, setSelectedInterest] = useState<InterestType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState<LocationType>("paris-chatelet");
  const [status, setStatus] = useState<StatusType>("all");
  const [orientation, setOrientation] = useState("");
  const [membershipTypes, setMembershipTypes] = useState<string[]>([]);
  const [openCurtains, setOpenCurtains] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
  }, [selectedInterest, searchTerm, status, orientation, membershipTypes, openCurtains]);

  const calculateCompatibilityScore = (
    profile: Profile,
    preferences: UserPreferences | null
  ): number => {
    if (!preferences) return 0;

    let score = 0;
    let total = 0;

    // Vérifier les types de relation (20 points par type en commun)
    if (profile.relationship_type) {
      score += profile.relationship_type.length * 20;
      total += profile.relationship_type.length * 20;
    }

    // Vérifier les intérêts spécifiques (15 points chacun)
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

      // Récupérer tous les profils et leurs préférences
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", session.user.id);

      if (profilesError) throw profilesError;

      // Récupérer toutes les préférences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from("preferences")
        .select("*");

      if (preferencesError) throw preferencesError;

      // Créer une map des préférences par user_id
      const preferencesMap = new Map(
        preferencesData.map(pref => [pref.user_id, pref])
      );

      // Associer les profils avec leurs préférences et calculer les scores
      let compatibleProfiles = profilesData.map((profile: Profile) => {
        const preferences = preferencesMap.get(profile.user_id) as UserPreferences;
        return {
          ...profile,
          compatibility_score: calculateCompatibilityScore(profile, preferences)
        };
      });

      // Appliquer les filtres
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

      // Trier par score de compatibilité
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
