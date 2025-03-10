
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
  const lastRefreshTime = useRef(Date.now());
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Fetch fresh profile from Supabase with improved caching control
  const fetchProfile = useCallback(async (forceRefresh = false) => {
    // Prevent multiple concurrent fetch attempts
    if (initialFetchAttemptedRef.current && !forceRefresh) {
      logger.info("Initial fetch already attempted, skipping redundant fetch");
      return null;
    }
    
    // Check last refresh time to avoid too frequent refreshes
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime.current;
    if (!forceRefresh && timeSinceLastRefresh < 5000) { // 5 seconds minimum between refreshes
      logger.info("Skipping profile refresh, too soon since last refresh", {
        timeSinceLastRefresh: `${Math.round(timeSinceLastRefresh / 1000)}s`
      });
      return profile;
    }
    
    initialFetchAttemptedRef.current = true;
    logger.info("Starting profile fetch", { forceRefresh });
    setIsLoading(true);
    setError(null);
    lastRefreshTime.current = now;
    
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
      
      // Get authenticated user with retries
      let user = null;
      let authError = null;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (!user && retryCount <= maxRetries) {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          authError = error;
          logger.warn(`Auth error retrieving user (attempt ${retryCount + 1}/${maxRetries + 1})`, { error });
          retryCount++;
          if (retryCount <= maxRetries) {
            // Add exponential backoff
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount)));
          }
        } else {
          user = data.user;
          break;
        }
      }
      
      if (authError && !user) {
        logger.error("Auth error retrieving user after retries", { error: authError });
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
      
      // Get user's profile with retries
      let profileData = null;
      let profileError = null;
      retryCount = 0;
      
      while (!profileData && retryCount <= maxRetries) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, username, full_name, avatar_url, role')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          profileError = error;
          logger.warn(`Error retrieving profile (attempt ${retryCount + 1}/${maxRetries + 1})`, { error });
          retryCount++;
          if (retryCount <= maxRetries) {
            // Add exponential backoff
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount)));
          }
        } else {
          profileData = data;
          profileError = error;
          break;
        }
      }
      
      if (profileError && profileError.code !== 'PGRST116') {
        logger.error("Error retrieving profile after retries", { error: profileError });
        throw profileError;
      }
        
      if (!profileData) {
        // Create profile if it doesn't exist
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
  }, [getCachedProfile, cacheProfile, logger, toast, profile]);

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
    
    // Clear any existing timeout
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    
    // Force initialization after a timeout to prevent hanging in loading state
    // Increased from 3s to 10s to give more time for fetch
    initTimeoutRef.current = setTimeout(() => {
      if (!isInitialized) {
        logger.warn("Profile initialization timeout - forcing initialization");
        setIsInitialized(true);
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout (increased from 3s)
    
    return () => {
      subscription.unsubscribe();
      // Clear timeout on unmount
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
    };
  }, [fetchProfile, clearProfileCache, logger, isInitialized]);

  // Add a function to check and refresh session if needed
  const checkAndRefreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        logger.error("Error checking session", { error });
        return false;
      }
      
      if (!data.session) {
        logger.warn("No active session found during check");
        setProfile(null);
        setProfileId(null);
        clearProfileCache();
        setIsInitialized(true);
        setIsLoading(false);
        return false;
      }
      
      // If we have a session but no profile, refresh the profile
      if (data.session && !profileId) {
        logger.info("Session exists but no profile loaded, refreshing profile");
        await fetchProfile(true);
      }
      
      return true;
    } catch (err) {
      logger.error("Exception in checkAndRefreshSession", { error: err });
      return false;
    }
  }, [logger, profileId, clearProfileCache, fetchProfile]);
  
  return {
    profile,
    profileId,
    isLoading,
    error,
    isInitialized,
    refreshProfile: () => fetchProfile(true),
    clearProfileCache,
    checkAndRefreshSession
  };
}
