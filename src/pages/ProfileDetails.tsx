import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { ProfileGallery } from "@/components/profile/ProfileGallery";
import { ProfileSeekingDisplay } from "@/components/profile/ProfileSeekingDisplay";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { ProfilePreferences } from "@/components/profile/ProfilePreferences";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { motion } from "framer-motion";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="animate-pulse text-burgundy"
        >
          Chargement...
        </motion.div>
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100"
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Button
          variant="ghost"
          className="mb-4 hover:bg-white/50 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 space-y-8"
        >
          <div className="flex flex-col items-center space-y-6 relative">
            {/* Decorative background elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-rose-100/50 rounded-full mix-blend-multiply filter blur-xl" />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-burgundy-100/50 rounded-full mix-blend-multiply filter blur-xl" />
            </div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ProfileHeader 
                avatarUrl={profile.avatar_url}
                fullName={profile.full_name}
                bio={profile.bio}
                sexualOrientation={profile.sexual_orientation}
                seeking={profile.seeking}
                relationshipType={profile.relationship_type}
              />
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              {preferences?.interests?.map((interest, index) => (
                <motion.span
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="px-4 py-2 bg-rose/20 text-burgundy rounded-full text-sm hover:bg-rose/30 transition-colors"
                >
                  {interest}
                </motion.span>
              ))}
            </motion.div>

            <ProfileActions profileId={profile.id} />
          </div>

          {profile.description && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 p-6 bg-champagne/30 rounded-lg backdrop-blur-sm"
            >
              <h2 className="text-xl font-semibold text-burgundy mb-4">À propos</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.description}</p>
            </motion.div>
          )}

          {profile.photo_urls && profile.photo_urls.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <ProfileGallery photos={profile.photo_urls} />
            </motion.div>
          )}
          
          {profile.seeking && profile.seeking.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <ProfileSeekingDisplay seeking={profile.seeking} />
            </motion.div>
          )}

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <ProfilePreferences preferences={preferences} profile={profile} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}