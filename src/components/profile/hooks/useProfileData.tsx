import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { createNewProfile, fetchExistingProfile, handleSessionError } from "./useProfileUtils";

export function useProfileData() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      console.log("Fetching user data...");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        const shouldRedirect = await handleSessionError(sessionError);
        if (shouldRedirect) {
          navigate('/login');
          return;
        }
        throw sessionError;
      }

      if (!sessionData.session) {
        console.log("No active session found");
        await supabase.auth.signOut();
        navigate('/login');
        return;
      }

      const { user } = sessionData.session;
      console.log("User data:", user);

      if (!user) {
        console.log("No user found, redirecting to login");
        navigate('/login');
        return;
      }

      console.log("Fetching profile for user:", user.id);
      const { profile: existingProfile, error: fetchError } = await fetchExistingProfile(user.id);

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          const newProfile = await createNewProfile(user.id, user.email);
          setProfile(newProfile);
          return;
        }
        throw fetchError;
      }

      if (!existingProfile) {
        const newProfile = await createNewProfile(user.id, user.email);
        setProfile(newProfile);
      } else {
        setProfile(existingProfile);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      
      if (error.message?.includes('session_not_found') || error.message?.includes('JWT')) {
        console.log("Session error detected, signing out...");
        await supabase.auth.signOut();
        navigate('/login');
        return;
      }

      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger votre profil. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      console.log("Updating profile with:", updates);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session, redirecting to login");
        navigate('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setProfile((prev: any) => ({ ...prev, ...updates }));
      console.log("Profile updated successfully");
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil.",
      });
    }
  };

  return { profile, loading, updateProfile };
}