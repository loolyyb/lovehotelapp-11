import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
        if (sessionError.message?.includes('refresh_token_not_found')) {
          await supabase.auth.signOut();
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
      let { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      console.log("Fetch result:", { existingProfile, fetchError });

      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        if (fetchError.code === 'PGRST116') {
          // Create new profile instead of using setNeedsProfile
          const defaultAvatarUrl = "/placeholder-couple.jpg";
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              user_id: user.id,
              full_name: user.email?.split('@')[0] || 'New User',
              is_love_hotel_member: false,
              is_loolyb_holder: false,
              relationship_type: [],
              seeking: [],
              photo_urls: [],
              visibility: 'public',
              allowed_viewers: [],
              role: 'user',
              avatar_url: defaultAvatarUrl
            }])
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
          return;
        }
        throw fetchError;
      }

      if (!existingProfile) {
        console.log("Creating new profile for user");
        const defaultAvatarUrl = "/placeholder-couple.jpg";
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert([{ 
            user_id: user.id,
            full_name: user.email?.split('@')[0] || 'New User',
            is_love_hotel_member: false,
            is_loolyb_holder: false,
            relationship_type: [],
            seeking: [],
            photo_urls: [],
            visibility: 'public',
            allowed_viewers: [],
            role: 'user',
            avatar_url: defaultAvatarUrl
          }])
          .select()
          .single();

        if (insertError) {
          console.error("Error creating profile:", insertError);
          throw insertError;
        }
        console.log("New profile created:", newProfile);
        setProfile(newProfile);
      } else {
        console.log("Using existing profile:", existingProfile);
        setProfile(existingProfile);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      
      // Check if it's a session error
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