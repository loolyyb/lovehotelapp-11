import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import { MatchingFilter } from "@/components/matching/MatchingFilter";
import { MatchingCard } from "@/components/matching/MatchingCard";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  interests: string[];
  compatibility_score?: number;
}

export default function MatchingScores() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterest, setSelectedInterest] = useState<string>("");
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

      // Fetch user preferences using maybeSingle() instead of single()
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

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          bio,
          preferences (
            interests
          )
        `)
        .neq("user_id", session.user.id);

      if (profilesError) throw profilesError;

      // Calculate compatibility scores
      const userInterests = userPreferences?.interests || [];
      const scoredProfiles = profiles.map((profile: any) => {
        const profileInterests = profile.preferences?.interests || [];
        
        const commonInterests = userInterests.filter((interest: string) => 
          profileInterests.includes(interest)
        );
        
        const compatibilityScore = (commonInterests.length / Math.max(userInterests.length, profileInterests.length)) * 100;

        return {
          ...profile,
          compatibility_score: Math.round(compatibilityScore)
        };
      });

      // Sort by compatibility score
      const sortedProfiles = scoredProfiles.sort((a, b) => 
        (b.compatibility_score || 0) - (a.compatibility_score || 0)
      );

      setProfiles(sortedProfiles);
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