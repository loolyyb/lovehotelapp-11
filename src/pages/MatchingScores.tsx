import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, MessageSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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

      const { data: userPreferences, error: preferencesError } = await supabase
        .from("preferences")
        .select("interests")
        .eq("user_id", session.user.id)
        .single();

      if (preferencesError) throw preferencesError;

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
      const scoredProfiles = profiles.map((profile: any) => {
        const userInterests = userPreferences?.interests || [];
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
    } catch (error) {
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

        <div className="mb-8 w-full max-w-md mx-auto">
          <Select
            value={selectedInterest}
            onValueChange={setSelectedInterest}
          >
            <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm">
              <SelectValue placeholder="Filtrer par intérêt" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les intérêts</SelectItem>
              <SelectItem value="bdsm">BDSM</SelectItem>
              <SelectItem value="jacuzzi">Jacuzzi</SelectItem>
              <SelectItem value="gastronomie">Gastronomie</SelectItem>
              <SelectItem value="rideaux_ouverts">Rideaux ouverts</SelectItem>
              <SelectItem value="speed_dating">Speed dating</SelectItem>
              <SelectItem value="libertinage">Libertinage</SelectItem>
              <SelectItem value="art">Art</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {profiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <div className="p-6 space-y-4">
                  <div 
                    className="flex items-center space-x-4 cursor-pointer"
                    onClick={() => handleProfileClick(profile.id)}
                  >
                    <div className="relative">
                      <img
                        src={profile.avatar_url || "/placeholder.svg"}
                        alt={profile.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full h-8 w-8 flex items-center justify-center font-bold">
                        {profile.compatibility_score}%
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-burgundy">
                        {profile.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {profile.bio}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-burgundy hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => handleProfileClick(profile.id)}
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      Profil
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-burgundy hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => handleMessageClick(profile.id)}
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
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