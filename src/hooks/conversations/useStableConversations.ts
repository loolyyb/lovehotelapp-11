
import { useState, useCallback, useEffect, useRef } from "react";
import { useLogger } from "@/hooks/useLogger";
import { useConversationsFetcher } from "./useConversationsFetcher";
import { useConversationCache } from "./useConversationCache";
import { useProfileState } from "@/hooks/useProfileState";

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
  const periodicRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const initialFetchAttemptedRef = useRef(false);
  
  // Use the centralized profile state
  const {
    profileId: currentProfileId,
    isLoading: profileLoading,
    error: profileError,
    refreshProfile,
    isInitialized: profileInitialized
  } = useProfileState();

  // Using memoized currentProfileId for the fetcher to prevent recreation
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

  // Log profile state - helpful for debugging
  useEffect(() => {
    logger.info("Profile state in useStableConversations", { 
      profileId: currentProfileId,
      profileInitialized,
      profileLoading,
      initialFetchAttempted: initialFetchAttemptedRef.current
    });
  }, [currentProfileId, profileInitialized, profileLoading, logger]);

  // Update loading state for better UX - only show loading state if we don't have any conversations to display
  useEffect(() => {
    if ((conversationsLoading || profileLoading) && !initialLoadCompleteRef.current) {
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

  // Load conversations when profile is ready
  useEffect(() => {
    // Skip if we've already attempted initial fetch and don't have a profile yet
    if (initialFetchAttemptedRef.current && !currentProfileId) {
      logger.info("Skipping fetch - no profile ID available and initial fetch already attempted");
      return;
    }
    
    // Only proceed if profile is initialized or we have a valid profile ID
    if (!profileInitialized && !currentProfileId) {
      logger.info("Profile not initialized yet, waiting...");
      return;
    }
    
    if (!currentProfileId) {
      logger.warn("Profile initialized but no ID available");
      initialFetchAttemptedRef.current = true;
      return;
    }
    
    logger.info("Profile ready, attempting to load conversations", { 
      profileId: currentProfileId,
      isInitialized: profileInitialized
    });
    
    initialFetchAttemptedRef.current = true;
    
    // Try to get cached conversations to display immediately
    const cachedConversations = getCachedConversations(currentProfileId);
    if (cachedConversations && cachedConversations.length > 0) {
      logger.info("Displaying cached conversations", { count: cachedConversations.length });
      setDisplayedConversations(cachedConversations);
      initialLoadCompleteRef.current = true;
    }
    
    // Fetch fresh conversations
    fetchConversations();
    
  }, [currentProfileId, profileInitialized, fetchConversations, getCachedConversations, logger]);

  // Update displayed conversations when pending conversations are ready
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

  // Set up periodic refresh with cleanup
  useEffect(() => {
    // Clear any existing interval first
    if (periodicRefreshRef.current) {
      clearInterval(periodicRefreshRef.current);
      periodicRefreshRef.current = null;
    }
    
    // Only set up periodic refresh if we have a valid profile
    if (currentProfileId && profileInitialized) {
      logger.info("Setting up periodic conversation refresh");
      
      // Set a new interval for refreshing conversations
      periodicRefreshRef.current = setInterval(() => {
        if (currentProfileId) {
          logger.info("Performing periodic conversation refresh");
          fetchConversations();
        }
      }, 60000); // Refresh every minute
    }
    
    // Cleanup interval on unmount
    return () => {
      if (periodicRefreshRef.current) {
        clearInterval(periodicRefreshRef.current);
        periodicRefreshRef.current = null;
      }
    };
  }, [currentProfileId, profileInitialized, fetchConversations, logger]);

  // Refresh conversations, but preserve displayed list until new data is ready
  const refreshConversations = useCallback(async (useCache = true) => {
    if (!currentProfileId) {
      logger.warn("No profile ID available, attempting to refresh profile");
      try {
        await refreshProfile();
        if (!currentProfileId) {
          logger.error("Still no profile ID after refresh");
          setError("Impossible de charger votre profil");
          return;
        }
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
      
      // Call fetchConversations to refresh data
      await fetchConversations(true); // Force fresh fetch
    } catch (err) {
      logger.error("Error refreshing conversations", { error: err });
    } finally {
      setIsRefreshing(false);
    }
  }, [currentProfileId, fetchConversations, refreshProfile, clearCache, logger]);

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
