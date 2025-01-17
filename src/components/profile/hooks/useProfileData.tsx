import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { createNewProfile, fetchExistingProfile, updateExistingProfile } from "../utils/profileUtils";
import { Tables } from "@/integrations/supabase/types";

export function useProfileData() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    getProfile();
  }, []);

  const handleSessionError = async () => {
    console.log("Session error detected, signing out...");
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleError = (error: any, message: string) => {
    console.error(message, error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: message,
    });
  };

  const getProfile = async () => {
    try {
      console.log("Fetching user data...");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }

      if (!sessionData.session) {
        console.log("No active session found");
        await handleSessionError();
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
      const { data: existingProfile, error: fetchError } = await fetchExistingProfile(user.id);

      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        throw fetchError;
      }

      if (!existingProfile) {
        console.log("Creating new profile for user");
        const { data: newProfile, error: createError } = await createNewProfile(user.id, user.email || '');
        
        if (createError) {
          throw createError;
        }
        
        console.log("New profile created:", newProfile);
        setProfile(newProfile);
      } else {
        console.log("Using existing profile:", existingProfile);
        setProfile(existingProfile);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      
      if (error.message?.includes('session_not_found') || error.message?.includes('JWT')) {
        await handleSessionError();
        return;
      }

      handleError(error, "Impossible de charger votre profil. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Tables<"profiles">>) => {
    try {
      console.log("Updating profile with:", updates);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session, redirecting to login");
        navigate('/login');
        return;
      }

      const { error } = await updateExistingProfile(session.user.id, updates);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      console.log("Profile updated successfully");
      
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
    } catch (error: any) {
      handleError(error, "Impossible de mettre à jour votre profil.");
    }
  };

  return { profile, loading, updateProfile };
}