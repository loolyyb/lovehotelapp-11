import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Blinds, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tables } from "@/integrations/supabase/types";
import { ProfileGallery } from "@/components/profile/ProfileGallery";
import { ProfileSeekingDisplay } from "@/components/profile/ProfileSeekingDisplay";
import { RelationshipStatusIcon } from "@/components/profile/RelationshipStatusIcon";

export default function ProfileDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [preferences, setPreferences] = useState<Tables<"preferences"> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileDetails();
  }, [id]);

  const fetchProfileDetails = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Ce profil n'existe pas.",
        });
        navigate("/");
        return;
      }

      setProfile(profileData);

      // Only fetch preferences if user_id exists
      if (profileData.user_id) {
        const { data: preferencesData, error: preferencesError } = await supabase
          .from("preferences")
          .select("*")
          .eq("user_id", profileData.user_id)
          .maybeSingle();

        if (preferencesError && preferencesError.code !== "PGRST116") {
          throw preferencesError;
        }

        setPreferences(preferencesData);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger ce profil.",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    toast({
      title: "Coup de cœur envoyé !",
      description: "Cette personne sera notifiée de votre intérêt.",
    });
  };

  const handleCurtainRequest = () => {
    toast({
      title: "Demande envoyée !",
      description: "Votre intérêt pour un moment rideau ouvert a été enregistré.",
    });
  };

  const handleMessage = () => {
    toast({
      title: "Bientôt disponible",
      description: "La messagerie sera disponible prochainement.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="animate-pulse text-burgundy">Chargement...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-burgundy">Profil non trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 pt-20 px-4 pb-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 space-y-8 animate-fadeIn">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <img
                src={profile.avatar_url ?? "/placeholder.svg"}
                alt={profile.full_name ?? "Profile"}
                className="w-full h-full object-cover rounded-full border-4 border-rose shadow-lg"
              />
              {profile.is_love_hotel_member && (
                <div className="absolute -top-2 -right-2">
                  <RelationshipStatusIcon 
                    type={profile.relationship_type} 
                    className="shadow-lg"
                  />
                </div>
              )}
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-burgundy">
                {profile.full_name}
              </h1>
              {profile.bio && (
                <p className="text-gray-600 max-w-2xl text-lg">{profile.bio}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {preferences?.interests?.map((interest, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-rose/20 text-burgundy rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleLike}
                      className="bg-burgundy hover:bg-burgundy/90"
                    >
                      <Heart className="mr-2 h-5 w-5" />
                      Coup de cœur
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Envoyer un coup de cœur</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleCurtainRequest}
                      variant="outline"
                      className="border-burgundy text-burgundy hover:bg-burgundy/10"
                    >
                      <Blinds className="mr-2 h-5 w-5" />
                      Rideau ouvert
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Demander un moment rideau ouvert</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleMessage}
                      variant="outline"
                      className="border-burgundy text-burgundy hover:bg-burgundy/10"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Message
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Envoyer un message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {profile.description && (
            <div className="mt-8 p-6 bg-champagne/30 rounded-lg">
              <h2 className="text-xl font-semibold text-burgundy mb-4">À propos</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.description}</p>
            </div>
          )}

          <ProfileGallery photos={profile.photo_urls} />
          
          <ProfileSeekingDisplay seeking={profile.seeking} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {preferences?.location && (
              <div className="p-4 bg-champagne/30 rounded-lg">
                <h3 className="font-semibold text-burgundy mb-2">Localisation</h3>
                <p className="text-gray-700">{preferences.location}</p>
              </div>
            )}
            {profile.sexual_orientation && (
              <div className="p-4 bg-champagne/30 rounded-lg">
                <h3 className="font-semibold text-burgundy mb-2">Orientation</h3>
                <p className="text-gray-700">{profile.sexual_orientation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
