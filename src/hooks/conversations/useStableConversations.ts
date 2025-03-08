
import { useState, useCallback, useEffect, useRef } from "react";
import { useLogger } from "@/hooks/useLogger";
import { useConversationsFetcher } from "./useConversationsFetcher";
import { useConversationCache } from "./useConversationCache";
import { useUserProfileRetrieval } from "./useUserProfileRetrieval";

/**
 * Hook that provides stable conversation list display
 * with separate pending and displayed states to prevent flickering
 */
export function useStableConversations() {
  const logger = useLogger("useStableConversations");
  const [displayedConversations, setDisplayedConversations] = useState<any[]>([]);
  const [isVisiblyLoading, setIsVisiblyLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadCompleteRef = useRef(false);
  const updatePendingRef = useRef(false);
  const lastDisplayUpdateRef = useRef(Date.now());
  
  const {
    currentProfileId,
    isLoading: profileLoading,
    error: profileError,
    getUserProfile
  } = useUserProfileRetrieval();

  const {
    conversations: pendingConversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    fetchConversations,
    loadMoreConversations,
    hasMore
  } = useConversationsFetcher(currentProfileId);
  
  const { 
    getCachedConversations, 
    cacheConversations, 
    isCacheValid,
    clearCache
  } = useConversationCache();

  // On initial mount, try to load the user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        logger.info("Initial user profile load");
        await getUserProfile();
        logger.info("Initial user profile loaded", { profileId: currentProfileId });
      } catch (err) {
        logger.error("Error loading initial user profile", { error: err });
        setError("Impossible de charger votre profil");
      }
    };
    
    loadProfile();
  }, []);

  // On initial mount, try to show cached conversations immediately
  useEffect(() => {
    if (!currentProfileId) return;
    
    // Try to get cached conversations to display immediately
    const cachedConversations = getCachedConversations(currentProfileId);
    if (cachedConversations && cachedConversations.length > 0) {
      logger.info("Displaying cached conversations", { count: cachedConversations.length });
      setDisplayedConversations(cachedConversations);
      initialLoadCompleteRef.current = true;
    } else {
      logger.info("No cached conversations found, will fetch from server");
    }
  }, [currentProfileId, getCachedConversations, logger]);

  // Update loading state for better UX - only show loading state if we don't have any conversations to display
  useEffect(() => {
    if (conversationsLoading && profileLoading && !initialLoadCompleteRef.current) {
      setIsVisiblyLoading(true);
    } else if (!conversationsLoading && !profileLoading) {
      setIsVisiblyLoading(false);
    }
  }, [conversationsLoading, profileLoading]);

  // Set refreshing state for background updates
  useEffect(() => {
    if (conversationsLoading && initialLoadCompleteRef.current) {
      setIsRefreshing(true);
    } else if (!conversationsLoading) {
      setIsRefreshing(false);
    }
  }, [conversationsLoading]);

  // Handle error state
  useEffect(() => {
    const newError = profileError || conversationsError || null;
    if (newError !== error) {
      setError(newError);
    }
  }, [profileError, conversationsError, error]);

  // Update displayed conversations when pending conversations are ready
  // with debounce to prevent rapid updates
  useEffect(() => {
    if (pendingConversations.length === 0 || updatePendingRef.current) return;
    
    // Don't update too frequently
    const now = Date.now();
    if (now - lastDisplayUpdateRef.current < 300) {
      if (!updatePendingRef.current) {
        updatePendingRef.current = true;
        setTimeout(() => {
          setDisplayedConversations(pendingConversations);
          initialLoadCompleteRef.current = true;
          lastDisplayUpdateRef.current = Date.now();
          updatePendingRef.current = false;
          logger.info("Updated displayed conversations (delayed)", { count: pendingConversations.length });
        }, 300);
      }
      return;
    }
    
    // Update displayed conversations and cache them
    setDisplayedConversations(pendingConversations);
    initialLoadCompleteRef.current = true;
    lastDisplayUpdateRef.current = now;
    
    // Cache the conversations if they're valid
    if (currentProfileId && pendingConversations.length > 0) {
      cacheConversations(currentProfileId, pendingConversations);
      logger.info("Updated displayed conversations and cache", { count: pendingConversations.length });
    }
  }, [pendingConversations, currentProfileId, cacheConversations, logger]);

  // Refresh conversations, but preserve displayed list until new data is ready
  const refreshConversations = useCallback(async (useCache = true) => {
    if (!currentProfileId) {
      logger.warn("No profile ID available, attempting to retrieve user profile");
      try {
        await getUserProfile();
      } catch (err) {
        logger.error("Error retrieving user profile during refresh", { error: err });
        setError("Impossible de charger votre profil");
        return;
      }
    }
    
    logger.info("Refreshing conversations", { 
      useCache, 
      hasProfileId: !!currentProfileId 
    });
    
    setIsRefreshing(true);
    
    try {
      if (!useCache) {
        // Clear the cache if we're doing a forced refresh
        clearCache();
      }
      
      await fetchConversations(useCache);
    } catch (err) {
      logger.error("Error refreshing conversations", { error: err });
    } finally {
      setIsRefreshing(false);
    }
  }, [currentProfileId, fetchConversations, getUserProfile, clearCache, logger]);

  return {
    conversations: displayedConversations,
    isLoading: isVisiblyLoading,
    isRefreshing,
    error,
    refreshConversations,
    loadMoreConversations,
    hasMoreConversations: hasMore,
    currentProfileId
  };
}
