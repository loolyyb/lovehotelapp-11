import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";
import { ProfileDetailsHeader } from "@/components/profile/ProfileDetailsHeader";
import { ProfileDetailsContent } from "@/components/profile/ProfileDetailsContent";
import { ProfileDetailsLoader } from "@/components/profile/ProfileDetailsLoader";

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
    return <ProfileDetailsLoader />;
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
        <ProfileDetailsHeader />
        <ProfileDetailsContent profile={profile} preferences={preferences} />
      </div>
    </motion.div>
  );
}