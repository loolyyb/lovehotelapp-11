
import { useState, useEffect, useCallback } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useLogger } from "@/hooks/useLogger";

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [refreshError, setRefreshError] = useState<Error | null>(null);
  const { toast } = useToast();
  const logger = useLogger("useAuthSession");
  
  // Function to create a new profile if needed
  const createProfile = async (userId: string) => {
    try {
      logger.info("Creating new profile for user:", userId);
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

      logger.info("New profile created successfully:", newProfile);
      return newProfile;
    } catch (error) {
      logger.error('Error creating profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer votre profil.",
      });
      return null;
    }
  };

  // Function to fetch user profile with retry logic
  const fetchUserProfile = useCallback(async (userId: string, retryCount = 0) => {
    if (!userId) {
      logger.warn("No user ID provided to fetchUserProfile");
      return;
    }
    
    try {
      logger.info("Fetching profile for user:", userId);
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
        setUserProfile(newProfile);
        return;
      }
      
      setUserProfile(profile);
      logger.info("Profile fetched successfully", { profileId: profile.id });
    } catch (error: any) {
      logger.error('Error fetching user profile:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        logger.info(`Retrying profile fetch in ${delay}ms (attempt ${retryCount + 1}/3)`);
        
        setTimeout(() => {
          fetchUserProfile(userId, retryCount + 1);
        }, delay);
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger votre profil après plusieurs tentatives.",
        });
      }
    }
  }, [toast, logger]);

  // Function to refresh the session token
  const refreshSession = useCallback(async () => {
    try {
      logger.info("Attempting to refresh session");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        logger.error("Error refreshing session:", error);
        setRefreshError(error);
        return false;
      }
      
      if (data.session) {
        logger.info("Session refreshed successfully");
        setSession(data.session);
        return true;
      } else {
        logger.warn("No session returned after refresh attempt");
        return false;
      }
    } catch (error: any) {
      logger.error("Exception during session refresh:", error);
      setRefreshError(error);
      return false;
    }
  }, [logger]);

  // Effect to initialize and monitor session
  useEffect(() => {
    let mounted = true;
    logger.info("Initializing auth session");
    
    // Configure automatic token refresh
    let refreshTimer: NodeJS.Timeout | null = null;
    
    // Function to set up the refresh timer
    const setupRefreshTimer = (session: Session | null) => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
      }
      
      if (!session) return;
      
      // Calculate when to refresh (5 minutes before expiry)
      const expiresAt = session.expires_at || 0;
      const expiresIn = expiresAt * 1000 - Date.now() - (5 * 60 * 1000); // 5 min before expiry
      
      if (expiresIn > 0) {
        logger.info(`Setting up session refresh in ${Math.round(expiresIn/1000)} seconds`);
        refreshTimer = setTimeout(() => {
          refreshSession();
        }, expiresIn);
      } else {
        // If already expired or about to expire, refresh immediately
        logger.info("Session expired or about to expire, refreshing immediately");
        refreshSession();
      }
    };

    // Get initial session
    const initializeSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error("Error getting initial session:", error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        if (mounted) {
          logger.info("Initial session retrieved:", { hasSession: !!initialSession });
          setSession(initialSession);
          
          if (initialSession?.user) {
            fetchUserProfile(initialSession.user.id);
            setupRefreshTimer(initialSession);
          }
          
          setLoading(false);
        }
      } catch (error) {
        logger.error("Exception during session initialization:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initializeSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      logger.info("Auth state changed:", event, newSession?.user?.id);
      
      if (mounted) {
        setSession(newSession);
        
        if (event === 'SIGNED_IN') {
          if (newSession?.user) {
            fetchUserProfile(newSession.user.id);
            setupRefreshTimer(newSession);
          }
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          if (refreshTimer) {
            clearTimeout(refreshTimer);
            refreshTimer = null;
          }
        } else if (event === 'TOKEN_REFRESHED') {
          logger.info("Token refreshed event received");
          setupRefreshTimer(newSession);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [fetchUserProfile, refreshSession, logger]);

  return { 
    session, 
    loading, 
    userProfile, 
    refreshError,
    refreshSession 
  };
};
