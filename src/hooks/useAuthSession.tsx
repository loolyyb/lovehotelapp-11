
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

const isPreviewEnvironment = () => {
  const hostname = window.location.hostname;
  return hostname.includes('preview--') && hostname.endsWith('.lovable.app');
};

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

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
            seeking: []
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
    if (isPreviewEnvironment()) {
      console.log("Preview environment detected, skipping profile fetch");
      return;
    }

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
    const initSession = async () => {
      if (isPreviewEnvironment()) {
        console.log("Preview environment detected, bypassing session check");
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (!isPreviewEnvironment()) {
        setSession(session);
        if (session) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading, userProfile };
};
