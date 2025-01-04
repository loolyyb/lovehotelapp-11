import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import { MatchingFilter } from "@/components/matching/MatchingFilter";
import { MatchingCard } from "@/components/matching/MatchingCard";
import { Database } from "@/integrations/supabase/types";

type InterestType = Database["public"]["Enums"]["interest_type"];
type FilterInterestType = InterestType | "all";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  compatibility_score?: number;
}

interface Preferences {
  interests: InterestType[];
}

export default function MatchingScores() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterest, setSelectedInterest] = useState<FilterInterestType>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
  }, [selectedInterest]);

  const fetchProfiles = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Fetch user preferences
      const { data: userPreferences, error: preferencesError } = await supabase
        .from("preferences")
        .select("interests")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (preferencesError) throw preferencesError;

      // If no preferences exist, create default preferences
      if (!userPreferences) {
        const { error: insertError } = await supabase
          .from("preferences")
          .insert([{ 
            user_id: session.user.id,
            interests: []
          }]);

        if (insertError) throw insertError;
      }

      // Fetch other profiles
      const { data: otherProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio")
        .neq("user_id", session.user.id);

      if (profilesError) throw profilesError;

      // Fetch preferences for other profiles
      const { data: otherPreferences, error: otherPreferencesError } = await supabase
        .from("preferences")
        .select("interests, user_id");

      if (otherPreferencesError) throw otherPreferencesError;

      // Create a map of user_id to preferences
      const preferencesMap = new Map(
        otherPreferences.map((pref) => [pref.user_id, (pref.interests || []) as InterestType[]])
      );

      // Calculate compatibility scores
      const userInterests = (userPreferences?.interests || []) as InterestType[];
      const scoredProfiles = otherProfiles.map((profile: any) => {
        const profileInterests = (preferencesMap.get(profile.user_id) || []) as InterestType[];
        
        const commonInterests = userInterests.filter((interest: InterestType) => 
          profileInterests.includes(interest)
        );
        
        const compatibilityScore = userInterests.length && profileInterests.length
          ? (commonInterests.length / Math.max(userInterests.length, profileInterests.length)) * 100
          : 0;

        return {
          ...profile,
          compatibility_score: Math.round(compatibilityScore)
        };
      });

      // Sort by compatibility score
      const sortedProfiles = scoredProfiles.sort((a, b) => 
        (b.compatibility_score || 0) - (a.compatibility_score || 0)
      );

      // Filter by selected interest if not "all"
      const filteredProfiles = selectedInterest === "all" 
        ? sortedProfiles 
        : sortedProfiles.filter((profile: any) => {
            const profileInterests = preferencesMap.get(profile.user_id) || [];
            return profileInterests.includes(selectedInterest);
          });

      setProfiles(filteredProfiles);
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
      <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="animate-pulse text-burgundy">Chargement...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-cormorant text-burgundy text-center mb-8 animate-fadeIn">
          Scores de Compatibilité
        </h1>

        <MatchingFilter 
          selectedInterest={selectedInterest}
          onInterestChange={setSelectedInterest}
        />

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