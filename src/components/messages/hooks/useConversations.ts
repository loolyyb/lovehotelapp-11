
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useLogger } from "@/hooks/useLogger";
import { useUserProfileRetrieval } from "@/hooks/conversations/useUserProfileRetrieval";
import { useConversationsFetcher } from "@/hooks/conversations/useConversationsFetcher";
import { useLatestMessagesFetcher } from "@/hooks/conversations/useLatestMessagesFetcher";
import { useConversationsRealtime } from "@/hooks/conversations/useConversationsRealtime";
import { useConversationCache } from "@/hooks/conversations/useConversationCache";
import { supabase } from "@/integrations/supabase/client";

export const useConversations = () => {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const logger = useLogger("useConversations");
  const fetchingRef = useRef(false);
  const debounceTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const fetchAttemptsRef = useRef(0);
  const previousConversationsRef = useRef<any[]>([]);
  const lastFetchTimeRef = useRef(0);
  const isMountedRef = useRef(true);

  // Import all the refactored hooks
  const {
    currentProfileId,
    setCurrentProfileId,
    isLoading: profileLoading,
    error: profileError,
    getUserProfile
  } = useUserProfileRetrieval();

  const {
    conversations,
    setConversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    fetchConversations,
    loadMoreConversations,
    hasMore
  } = useConversationsFetcher(currentProfileId);

  const { fetchLatestMessages } = useLatestMessagesFetcher();
  
  const { 
    cacheProfile, 
    getCachedProfile, 
    clearCache 
  } = useConversationCache();

  // Combine loading and error states
  const isLoading = profileLoading || conversationsLoading;
  
  // Only update error state when it actually changes
  useEffect(() => {
    const newError = profileError || conversationsError || null;
    if (newError !== error) {
      setError(newError);
    }
  }, [profileError, conversationsError, error]);

  // Set mounted ref
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Diagnostic check for profile and username - only run once per profile ID
  useEffect(() => {
    if (!currentProfileId || !isMountedRef.current) return;
    
    // Check if we have this profile cached first
    const cachedProfile = getCachedProfile(currentProfileId);
    if (cachedProfile) {
      logger.info("Using cached profile details", {
        profileId: cachedProfile.id,
        username: cachedProfile.username
      });
      return;
    }
    
    // Fetch profile details
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('id', currentProfileId)
        .single();
        
      if (error) {
        logger.error("Error fetching profile details", { error });
      } else if (data && isMountedRef.current) {
        logger.info("User profile found", {
          profileId: data.id,
          username: data.username,
          fullName: data.full_name
        });
        // Cache the profile
        cacheProfile(data.id, data);
      }
    };
    
    fetchProfile();
  }, [currentProfileId, logger, cacheProfile, getCachedProfile]);

  // Main fetch function with optimizations to prevent unnecessary renders
  const fetchConversationsWithMessages = useCallback(async (useCache = true) => {
    // Use ref to prevent multiple simultaneous fetches
    if (fetchingRef.current || !isMountedRef.current) {
      logger.info("Fetch already in progress or component unmounted, skipping", { useCache });
      return;
    }
    
    // Throttle requests - don't allow more than one fetch every 2 seconds
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 2000 && fetchAttemptsRef.current > 0) {
      logger.info("Throttling fetch request, too soon after previous fetch", {
        msSinceLastFetch: now - lastFetchTimeRef.current
      });
      return;
    }
    
    fetchingRef.current = true;
    lastFetchTimeRef.current = now;

    try {
      logger.info("Starting conversations fetch process", { 
        attempt: fetchAttemptsRef.current + 1,
        useCache
      });
      fetchAttemptsRef.current += 1;
      
      // 1. Get user profile if not already available
      if (!currentProfileId) {
        const profileId = await getUserProfile();
        if (!profileId) {
          logger.error("Could not retrieve user profile", { reason: "profile_retrieval_failed" });
          fetchingRef.current = false;
          return;
        }
      }

      // 2. Fetch conversations for the user with optional caching
      const fetchedConversations = await fetchConversations(useCache);
      
      if (!isMountedRef.current) {
        fetchingRef.current = false;
        return;
      }
      
      // Skip unnecessary updates if the data hasn't changed
      const hasChanged = JSON.stringify(fetchedConversations) !== JSON.stringify(previousConversationsRef.current);
      
      if (!hasChanged && previousConversationsRef.current.length > 0) {
        logger.info("Conversations haven't changed, skipping update");
        fetchingRef.current = false;
        return;
      }
      
      if (fetchedConversations && fetchedConversations.length > 0) {
        // Update reference for future comparisons
        previousConversationsRef.current = fetchedConversations;
        
        // 3. Fetch latest message for each conversation if we have conversations
        const conversationsWithMessages = await fetchLatestMessages(fetchedConversations);
        
        if (isMountedRef.current) {
          // 4. Update state with the completed data
          setConversations(conversationsWithMessages);
        }
      } else if (fetchedConversations && fetchedConversations.length === 0) {
        // Clear previous conversations reference
        previousConversationsRef.current = [];
      }
      
      // Reset retry counter on success
      retryCountRef.current = 0;
    } catch (error: any) {
      logger.error("Error in fetchConversationsWithMessages", {
        error: error.message,
        stack: error.stack
      });
      if (isMountedRef.current) {
        setError("Impossible de charger les conversations. Veuillez réessayer plus tard.");
      }
    } finally {
      fetchingRef.current = false;
    }
  }, [
    currentProfileId, 
    logger, 
    getUserProfile, 
    fetchConversations, 
    fetchLatestMessages, 
    setConversations
  ]);

  // Initial fetch - only run once, and when dependencies change
  useEffect(() => {
    if (currentProfileId && !fetchingRef.current) {
      fetchConversationsWithMessages();
    }
    
    // Clear cache on component unmount
    return () => {
      clearCache();
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchConversationsWithMessages, clearCache, currentProfileId]);

  // Handle conversation changes with debounce and throttling to prevent cascading updates
  const handleConversationChange = useCallback(() => {
    // Skip updates if already fetching or if throttled
    if (fetchingRef.current || (Date.now() - lastFetchTimeRef.current < 2000) || !isMountedRef.current) {
      return;
    }
    
    logger.info("Conversation change detected", { timestamp: new Date().toISOString() });
    
    // Debounce the refresh to prevent too many updates
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = window.setTimeout(() => {
      if (!fetchingRef.current && isMountedRef.current) {
        fetchConversationsWithMessages(false); // Force fresh fetch
      }
      debounceTimerRef.current = null;
    }, 800);  // Increased debounce time to prevent rapid firing
  }, [logger, fetchConversationsWithMessages]);

  // Setup realtime subscription for conversation updates
  const { handleNewMessage: realtimeMessageHandler } = useConversationsRealtime(
    currentProfileId,
    handleConversationChange,
    () => {} // We handle messages separately
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Setup realtime subscription for messages
  useRealtimeMessages({
    currentProfileId,
    onNewMessage: realtimeMessageHandler,
  });

  // Use memoized state to prevent unnecessary rerenders
  const result = useMemo(() => ({ 
    conversations, 
    isLoading, 
    error, 
    refetch: () => fetchConversationsWithMessages(false), 
    currentProfileId,
    loadMoreConversations,
    hasMoreConversations: hasMore
  }), [
    conversations, 
    isLoading, 
    error, 
    fetchConversationsWithMessages, 
    currentProfileId,
    loadMoreConversations,
    hasMore
  ]);

  return result;
};
