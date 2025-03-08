
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
  const [isVisiblyLoading, setIsVisiblyLoading] = useState(true);
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
      initialFetchAttempted: initialFetchAttemptedRef.current,
      conversationsLength: pendingConversations.length
    });
  }, [currentProfileId, profileInitialized, profileLoading, logger, pendingConversations.length]);

  // Update loading state for better UX
  useEffect(() => {
    // Start with loading state and clear it when:
    // 1. We have conversations to display
    // 2. We've completed profile loading AND attempted to fetch conversations
    const shouldBeLoading = 
      (conversationsLoading || profileLoading) && 
      !initialLoadCompleteRef.current && 
      displayedConversations.length === 0;
    
    setIsVisiblyLoading(shouldBeLoading);
  }, [conversationsLoading, profileLoading, displayedConversations.length]);

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
    // If we don't have a profile yet but profile loading is complete, mark fetch as attempted
    if (!currentProfileId && !profileLoading && profileInitialized) {
      if (!initialFetchAttemptedRef.current) {
        logger.info("Profile loading complete but no ID available, marking fetch as attempted");
        initialFetchAttemptedRef.current = true;
      }
      return;
    }
    
    // Only proceed if we have a valid profile ID
    if (!currentProfileId) {
      logger.info("Waiting for profile ID before loading conversations");
      return;
    }
    
    // Skip if we've already attempted initial fetch with this profile ID
    if (initialFetchAttemptedRef.current && !initialLoadCompleteRef.current) {
      logger.info("Initial fetch already attempted, waiting for completion");
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
    
  }, [currentProfileId, profileInitialized, profileLoading, fetchConversations, getCachedConversations, logger]);

  // Update displayed conversations when pending conversations are ready
  useEffect(() => {
    if (pendingConversations.length === 0 && !initialLoadCompleteRef.current && currentProfileId) {
      // Mark initial load as complete even if there are no conversations
      // This helps with showing the empty state instead of perpetual loading
      initialLoadCompleteRef.current = true;
      return;
    }
    
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
