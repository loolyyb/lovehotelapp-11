
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { useToast } from "@/hooks/use-toast";

// Default TTL for cached profile (4 hours)
const PROFILE_CACHE_TTL = 4 * 60 * 60 * 1000;

// Keys for localStorage
const PROFILE_KEY = 'user_profile_data';
const PROFILE_TIMESTAMP_KEY = 'user_profile_timestamp';

interface CachedProfile {
  id: string;           // Profile ID (not auth user ID)
  user_id: string;      // Auth user ID
  full_name?: string;
  username?: string;
  avatar_url?: string;
  role?: string;
  // ... add other fields as needed
}

export function useProfileState() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState<CachedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const logger = useLogger("useProfileState");
  const { toast } = useToast();

  // Get cached profile from localStorage
  const getCachedProfile = useCallback(() => {
    try {
      const profileStr = localStorage.getItem(PROFILE_KEY);
      const timestampStr = localStorage.getItem(PROFILE_TIMESTAMP_KEY);
      
      if (!profileStr || !timestampStr) return null;
      
      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();
      
      // Check if cache is expired
      if (now - timestamp > PROFILE_CACHE_TTL) {
        logger.info("Cached profile expired, clearing");
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem(PROFILE_TIMESTAMP_KEY);
        return null;
      }
      
      const cachedProfile = JSON.parse(profileStr) as CachedProfile;
      logger.info("Using cached profile", { profileId: cachedProfile.id });
      return cachedProfile;
    } catch (error) {
      logger.error("Error retrieving cached profile", { error });
      return null;
    }
  }, [logger]);

  // Cache profile in localStorage
  const cacheProfile = useCallback((profile: CachedProfile) => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      localStorage.setItem(PROFILE_TIMESTAMP_KEY, Date.now().toString());
      logger.info("Profile cached in localStorage", { profileId: profile.id });
    } catch (error) {
      logger.error("Error caching profile", { error });
    }
  }, [logger]);

  // Clear profile cache
  const clearProfileCache = useCallback(() => {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(PROFILE_TIMESTAMP_KEY);
    logger.info("Profile cache cleared");
  }, [logger]);

  // Fetch fresh profile from Supabase
  const fetchProfile = useCallback(async (forceRefresh = false) => {
    // Don't fetch if we're already loading and not forcing refresh
    if (isLoading && !forceRefresh) {
      logger.info("Already loading profile, skipping fetch");
      return null;
    }
    
    logger.info("Starting profile fetch", { forceRefresh });
    setIsLoading(true);
    setError(null);
    
    try {
      // First check if we already have a cached profile
      if (!forceRefresh) {
        const cachedProfile = getCachedProfile();
        if (cachedProfile) {
          setProfile(cachedProfile);
          setProfileId(cachedProfile.id);
          setIsLoading(false);
          setIsInitialized(true);
          logger.info("Using cached profile", { profileId: cachedProfile.id });
          return cachedProfile;
        }
      }
      
      logger.info("Fetching fresh profile from Supabase");
      
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        logger.error("Auth error retrieving user", { error: authError });
        throw authError;
      }
      
      if (!user) {
        logger.warn("No authenticated user found");
        setProfileId(null);
        setProfile(null);
        setIsLoading(false);
        setIsInitialized(true);
        return null;
      }
      
      logger.info("Auth user found, retrieving profile", { userId: user.id });
      
      // Get user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, username, full_name, avatar_url, role')
        .eq('user_id', user.id)
        .single();
        
      if (profileError) {
        // If not found, try to create a profile
        if (profileError.code === 'PGRST116') {
          logger.warn("Profile not found, creating one", { userId: user.id });
          
          const newProfileId = crypto.randomUUID();
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: newProfileId,
              user_id: user.id,
              full_name: user.email?.split('@')[0] || 'Utilisateur',
              username: user.email?.split('@')[0] || `user_${Math.floor(Math.random() * 10000)}`,
              role: 'user'
            }])
            .select()
            .single();
            
          if (createError) {
            logger.error("Error creating profile", { error: createError });
            throw createError;
          }
          
          logger.info("New profile created", { profileId: newProfileId });
          setProfile(newProfile);
          setProfileId(newProfileId);
          cacheProfile(newProfile);
          setIsLoading(false);
          setIsInitialized(true);
          return newProfile;
        }
        
        logger.error("Error retrieving profile", { error: profileError });
        throw profileError;
      }
      
      logger.info("Profile retrieved successfully", { profileId: profileData.id });
      setProfile(profileData);
      setProfileId(profileData.id);
      cacheProfile(profileData);
      setIsLoading(false);
      setIsInitialized(true);
      return profileData;
    } catch (error: any) {
      logger.error("Error fetching profile", { error: error.message });
      setError(error.message);
      setIsLoading(false);
      setIsInitialized(true);
      
      toast({
        variant: "destructive",
        title: "Erreur de profil",
        description: "Impossible de récupérer votre profil. Veuillez vous reconnecter."
      });
      
      return null;
    }
  }, [getCachedProfile, cacheProfile, logger, toast, isLoading]);

  // Initial profile loading - run only once on mount
  useEffect(() => {
    logger.info("Initial profile loading effect running");
    // First call to fetchProfile
    fetchProfile();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      logger.info("Auth state changed", { event, hasUser: !!session?.user });
      
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setProfileId(null);
        clearProfileCache();
        setIsInitialized(true);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Force refresh on sign in or token refresh
        fetchProfile(true);
      } else if (event === 'USER_UPDATED') {
        // Refresh profile when user is updated
        fetchProfile(true);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, clearProfileCache, logger]);

  // Force initialization after a timeout to prevent hanging in loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isInitialized) {
        logger.warn("Profile initialization timeout - forcing initialization");
        setIsInitialized(true);
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timer);
  }, [isInitialized, logger]);

  return {
    profile,
    profileId,
    isLoading,
    error,
    isInitialized,
    refreshProfile: () => fetchProfile(true),
    clearProfileCache
  };
}
