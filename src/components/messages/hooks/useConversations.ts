
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

  const isLoading = profileLoading || conversationsLoading;
  
  useEffect(() => {
    const newError = profileError || conversationsError || null;
    if (newError !== error) {
      setError(newError);
    }
  }, [profileError, conversationsError, error]);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!currentProfileId || !isMountedRef.current) return;
    
    const cachedProfile = getCachedProfile(currentProfileId);
    if (cachedProfile) {
      logger.info("Using cached profile details", {
        profileId: cachedProfile.id,
        username: cachedProfile.username
      });
      return;
    }
    
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
          cacheProfile(data.id, data);
        }
      } catch (error) {
        logger.error("Exception in fetchProfile", { error });
      }
    };
    
    fetchProfile();
  }, [currentProfileId, logger, cacheProfile, getCachedProfile]);

  const fetchConversationsWithMessages = useCallback(async (useCache: boolean = true) => {
    if (fetchingRef.current || !isMountedRef.current) {
      logger.info("Fetch already in progress or component unmounted, skipping", { useCache });
      return;
    }
    
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
      
      if (!currentProfileId) {
        const profileId = await getUserProfile();
        if (!profileId) {
          logger.error("Could not retrieve user profile", { reason: "profile_retrieval_failed" });
          fetchingRef.current = false;
          return;
        }
      }

      // Fix the call to fetchConversations by explicitly passing the useCache parameter
      const fetchedConversations = await fetchConversations(useCache);
      
      if (!isMountedRef.current) {
        fetchingRef.current = false;
        return;
      }
      
      const hasChanged = JSON.stringify(fetchedConversations) !== JSON.stringify(previousConversationsRef.current);
      
      if (!hasChanged && previousConversationsRef.current.length > 0) {
        logger.info("Conversations haven't changed, skipping update");
        fetchingRef.current = false;
        return;
      }
      
      if (fetchedConversations && fetchedConversations.length > 0) {
        previousConversationsRef.current = fetchedConversations;
        
        const conversationsWithMessages = await fetchLatestMessages(fetchedConversations);
        
        if (isMountedRef.current) {
          setConversations(conversationsWithMessages);
        }
      } else if (fetchedConversations && fetchedConversations.length === 0) {
        previousConversationsRef.current = [];
      }
      
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
    
    return () => {
      clearCache();
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchConversationsWithMessages, clearCache, currentProfileId]);

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

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profile) {
          logger.info("Profile found during initialization, fetching conversations", { profileId: profile.id });
          setCurrentProfileId(profile.id);
          // Fix: Pass false to the fetchConversations call to avoid using the cache during initialization
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

  const handleConversationChange = useCallback(() => {
    if (fetchingRef.current || (Date.now() - lastFetchTimeRef.current < 2000) || !isMountedRef.current) {
      return;
    }
    
    logger.info("Conversation change detected", { timestamp: new Date().toISOString() });
    
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = window.setTimeout(() => {
      if (!fetchingRef.current && isMountedRef.current) {
        // Fix: Pass the correct useCache parameter (false) to refresh data
        fetchConversationsWithMessages(false);
      }
      debounceTimerRef.current = null;
    }, 800);
  }, [logger, fetchConversationsWithMessages]);

  const handleMessageUpdate = useCallback((message: any) => {
    logger.info("Message update received", { 
      messageId: message.id, 
      conversationId: message.conversation_id
    });
    
    if (conversations.some(conv => conv.id === message.conversation_id)) {
      handleConversationChange();
    }
  }, [logger, conversations, handleConversationChange]);

  const { handleNewMessage: realtimeMessageHandler } = useConversationsRealtime(
    currentProfileId,
    handleConversationChange,
    () => {}
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useRealtimeMessages({
    currentProfileId,
    onNewMessage: realtimeMessageHandler,
    onMessageUpdate: handleMessageUpdate
  });

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
