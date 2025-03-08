
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
      try {
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
      } catch (error) {
        logger.error("Exception in fetchProfile", { error });
      }
    };
    
    fetchProfile();
  }, [currentProfileId, logger, cacheProfile, getCachedProfile]);

  // Main fetch function with optimizations to prevent unnecessary renders
  const fetchConversationsWithMessages = useCallback(async (useCache: boolean = true) => {
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
      // Pass useCache parameter to fetchConversations - this is the line causing the error
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
      logger.info("currentProfileId is available, fetching conversations", { currentProfileId });
      fetchConversationsWithMessages();
    } else {
      logger.info("Waiting for currentProfileId before fetching", { 
        hasCurrentProfileId: !!currentProfileId,
        isFetching: fetchingRef.current
      });
    }
    
    // Clear cache on component unmount
    return () => {
      clearCache();
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchConversationsWithMessages, clearCache, currentProfileId]);

  // Initialize profile and fetch conversations
  useEffect(() => {
    const initializeData = async () => {
      if (fetchingRef.current) return;
      
      try {
        logger.info("Initializing conversations data");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (!session) {
          logger.warn("No session found during initialization");
          setError("User not authenticated");
          return;
        }

        // Get profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profile) {
          logger.info("Profile found during initialization, fetching conversations", { profileId: profile.id });
          setCurrentProfileId(profile.id);
          // Update this line to pass the useCache parameter
          await fetchConversations(false);
        } else {
          logger.warn("No profile found for authenticated user", { userId: session.user.id });
        }
      } catch (error) {
        logger.error("Error initializing conversations data", { error });
        setError("Failed to load conversations");
      }
    };

    initializeData();
  }, []);

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
        // Pass useCache parameter to prevent the TS error
        fetchConversationsWithMessages(false);
      }
      debounceTimerRef.current = null;
    }, 800);  // Increased debounce time to prevent rapid firing
  }, [logger, fetchConversationsWithMessages]);

  // Handle message updates
  const handleMessageUpdate = useCallback((message: any) => {
    logger.info("Message update received", { 
      messageId: message.id, 
      conversationId: message.conversation_id
    });
    
    // If the message belongs to a conversation we have, refresh conversations
    if (conversations.some(conv => conv.id === message.conversation_id)) {
      handleConversationChange();
    }
  }, [logger, conversations, handleConversationChange]);

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
    onMessageUpdate: handleMessageUpdate
  });

  // Use memoized state to prevent unnecessary rerenders
  const result = useMemo(() => ({ 
    conversations, 
    isLoading: profileLoading || conversationsLoading,
    error: error || profileError || conversationsError,
    refetch: () => fetchConversations(false),
    currentProfileId,
    loadMoreConversations,
    hasMoreConversations: hasMore
  }), [
    conversations,
    profileLoading,
    conversationsLoading,
    error,
    profileError,
    conversationsError,
    fetchConversations,
    currentProfileId,
    loadMoreConversations,
    hasMore
  ]);

  return result;
};
