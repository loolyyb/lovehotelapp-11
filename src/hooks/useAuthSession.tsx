import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useNavigate } from "react-router-dom";

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSessionError = async () => {
    console.log("Session error detected, cleaning up...");
    setSession(null);
    setUserProfile(null);
    localStorage.removeItem('supabase.auth.token');
    await supabase.auth.signOut();
    navigate('/login');
  };

  const createProfile = async (userId: string) => {
    try {
      console.log("Creating new profile for user:", userId);
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
            seeking: [],
            avatar_url: '/couple-default.jpg'
          }
        ])
        .select()
        .single();

      if (createError) throw createError;

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
        const newProfile = await createProfile(userId);
        setUserProfile(newProfile);
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
    let authListener: any;

    const initSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          if (mounted) {
            await handleSessionError();
          }
          return;
        }

        if (mounted) {
          setSession(currentSession);
          if (currentSession?.user?.id) {
            await fetchUserProfile(currentSession.user.id);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Session initialization error:", error);
        if (mounted) {
          await handleSessionError();
          setLoading(false);
        }
      }
    };

    const setupAuthListener = () => {
      authListener = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setSession(null);
          setUserProfile(null);
          navigate('/login');
          return;
        }

        if (currentSession) {
          setSession(currentSession);
          if (currentSession.user?.id) {
            await fetchUserProfile(currentSession.user.id);
          }
        }
      });
    };

    initSession();
    setupAuthListener();

    return () => {
      mounted = false;
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return { session, loading, userProfile };
};