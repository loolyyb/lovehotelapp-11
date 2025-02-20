
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  const createProfile = async (userId: string) => {
    try {
      console.log("Creating new profile for user:", userId);
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingProfile) {
        console.log("Profile already exists for user:", userId);
        return existingProfile;
      }

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: userId,
            full_name: session?.user?.email?.split('@')[0] || 'New User',
            role: 'user',
            visibility: 'public',
            allowed_viewers: [],
            loolyb_tokens: 0,
            loyalty_points: 0,
            is_love_hotel_member: false,
            is_loolyb_holder: false,
            photo_urls: [],
            relationship_type: [],
            seeking: []
          }
        ])
        .select()
        .single();

      if (createError) throw createError;

      // Create initial preferences for qualification
      const { error: prefError } = await supabase
        .from('preferences')
        .insert([{
          user_id: userId,
          qualification_completed: false,
          qualification_step: 0
        }]);

      if (prefError) throw prefError;

      console.log("New profile created successfully:", newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer votre profil.",
      });
      return null;
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!profile) {
        // Create profile if it doesn't exist
        const newProfile = await createProfile(userId);
        if (newProfile) {
          setUserProfile(newProfile);
        }
        return;
      }
      
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger votre profil.",
      });
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            await fetchUserProfile(initialSession.user.id);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event, currentSession?.user?.id);
      
      if (mounted) {
        setSession(currentSession);
        
        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user.id);
        } else {
          setUserProfile(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading, userProfile };
};
