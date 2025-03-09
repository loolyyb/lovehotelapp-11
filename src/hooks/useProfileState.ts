
import { useState, useEffect, useCallback, useRef } from "react";
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
  const initialFetchAttemptedRef = useRef(false);
  const fetchInProgressRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    // Prevent multiple concurrent fetch attempts
    if (fetchInProgressRef.current && !forceRefresh) {
      logger.info("Fetch already in progress, skipping redundant fetch");
      return null;
    }
    
    fetchInProgressRef.current = true;
    initialFetchAttemptedRef.current = true;
    logger.info("Starting profile fetch", { forceRefresh, retryCount: retryCountRef.current });
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
          fetchInProgressRef.current = false;
          retryCountRef.current = 0;
          logger.info("Using cached profile", { profileId: cachedProfile.id });
          return cachedProfile;
        }
      }
      
      logger.info("Fetching fresh profile from Supabase");
      
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        logger.error("Auth error retrieving user", { error: authError });
        
        // Try to refresh the session if there's an auth error
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          logger.error("Failed to refresh session", { error: refreshError });
          throw authError;
        }
        
        logger.info("Session refreshed successfully, retrying profile fetch");
        // Use the refreshed session to get the user
        const { data: { user: refreshedUser }, error: retryError } = await supabase.auth.getUser();
        
        if (retryError || !refreshedUser) {
          logger.error("Auth error after session refresh", { error: retryError });
          throw retryError || new Error("Failed to get user after session refresh");
        }
        
        user = refreshedUser;
      }
      
      if (!user) {
        logger.warn("No authenticated user found");
        setProfileId(null);
        setProfile(null);
        setIsLoading(false);
        setIsInitialized(true);
        fetchInProgressRef.current = false;
        return null;
      }
      
      logger.info("Auth user found, retrieving profile", { userId: user.id });
      
      // Get user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, username, full_name, avatar_url, role')
        .eq('user_id', user.id)
        .maybeSingle();
        
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
          fetchInProgressRef.current = false;
          retryCountRef.current = 0;
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
      fetchInProgressRef.current = false;
      retryCountRef.current = 0;
      return profileData;
    } catch (error: any) {
      logger.error("Error fetching profile", { error: error.message });
      setError(error.message);
      setIsLoading(false);
      setIsInitialized(true);
      fetchInProgressRef.current = false;
      
      // Implement retry with exponential backoff
      retryCountRef.current += 1;
      
      if (retryCountRef.current <= maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
        logger.info(`Scheduling retry ${retryCountRef.current}/${maxRetries} in ${delayMs}ms`);
        
        // Clear any existing timeout
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        
        // Schedule a retry
        retryTimeoutRef.current = setTimeout(() => {
          logger.info(`Executing retry ${retryCountRef.current}/${maxRetries}`);
          fetchProfile(true);
        }, delayMs);
      } else {
        toast({
          variant: "destructive",
          title: "Erreur de profil",
          description: "Impossible de récupérer votre profil. Veuillez vous reconnecter."
        });
      }
      
      return null;
    }
  }, [getCachedProfile, cacheProfile, logger, toast]);

  // Initial profile loading - run only once on mount
  useEffect(() => {
    const isMounted = true;
    logger.info("Initial profile loading effect running");
    
    // Only run this effect once using the initialFetchAttemptedRef
    if (!initialFetchAttemptedRef.current) {
      fetchProfile();
    }
    
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
    
    // Force initialization after a timeout to prevent hanging in loading state
    const timer = setTimeout(() => {
      if (!isInitialized) {
        logger.warn("Profile initialization timeout - forcing initialization");
        setIsInitialized(true);
        setIsLoading(false);
      }
    }, 3000); // 3 second timeout (reduced from 5s)
    
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
      
      // Clear any pending retry timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchProfile, clearProfileCache, logger, isInitialized]);

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
