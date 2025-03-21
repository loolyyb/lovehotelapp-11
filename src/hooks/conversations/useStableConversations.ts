
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
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadFailedRef = useRef(false);
  const waitingForProfileRef = useRef(false);
  
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
      conversationsLength: pendingConversations.length,
      waitingForProfile: waitingForProfileRef.current
    });
    
    // If we were waiting for profile and now we have it, mark flag as false
    if (waitingForProfileRef.current && currentProfileId && profileInitialized) {
      waitingForProfileRef.current = false;
      logger.info("Profile now available, can proceed with conversation loading");
    }
  }, [currentProfileId, profileInitialized, profileLoading, logger, pendingConversations.length]);

  // Ensure loading state clears after a timeout to prevent infinite loading
  useEffect(() => {
    // Clear any existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    // Set a timeout to ensure loading state doesn't persist indefinitely
    // Increased timeout from 6s to 15s for more reliable loading
    loadTimeoutRef.current = setTimeout(() => {
      if (isVisiblyLoading) {
        logger.warn("Loading state timeout reached - forcing completion", {
          profileId: currentProfileId,
          hasConversations: pendingConversations.length > 0,
          profileInitialized
        });
        setIsVisiblyLoading(false);
        initialLoadCompleteRef.current = true;
        
        // If we still don't have conversations, try one more time with cache cleared
        if (pendingConversations.length === 0 && currentProfileId && !initialLoadFailedRef.current) {
          logger.warn("No conversations loaded after timeout, attempting forced refresh", {
            profileId: currentProfileId
          });
          initialLoadFailedRef.current = true;
          // Clear cache and try again
          clearCache();
          fetchConversations(true);
        }
      }
    }, 15000); // 15 second timeout (increased from 6s)
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isVisiblyLoading, profileInitialized, currentProfileId, pendingConversations.length, logger, clearCache, fetchConversations]);

  // Update loading state for better UX
  useEffect(() => {
    // If profile is still loading and not yet initialized, mark as waiting for profile
    if (profileLoading && !profileInitialized && !waitingForProfileRef.current) {
      waitingForProfileRef.current = true;
      logger.info("Waiting for profile to initialize before loading conversations");
    }
    
    // Start with loading state and clear it when:
    // 1. We have conversations to display
    // 2. We've completed profile loading AND attempted to fetch conversations
    const shouldBeLoading = 
      (conversationsLoading || (profileLoading && !profileInitialized && !currentProfileId)) && 
      !initialLoadCompleteRef.current && 
      displayedConversations.length === 0;
    
    setIsVisiblyLoading(shouldBeLoading);
    
    // If loading takes too long, ensure we eventually display any results or an empty state
    if (!shouldBeLoading && !initialLoadCompleteRef.current && profileInitialized) {
      initialLoadCompleteRef.current = true;
    }
  }, [conversationsLoading, profileLoading, displayedConversations.length, profileInitialized, currentProfileId, logger]);

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
    fetchConversations(false); // Use cache for initial load to improve speed
    
  }, [currentProfileId, profileInitialized, profileLoading, fetchConversations, getCachedConversations, logger]);

  // Update displayed conversations when pending conversations are ready
  useEffect(() => {
    if (pendingConversations.length === 0 && !initialLoadCompleteRef.current && currentProfileId && !conversationsLoading) {
      logger.info("No conversations found, marking initial load as complete");
      // Mark initial load as complete even if there are no conversations
      // This helps with showing the empty state instead of perpetual loading
      initialLoadCompleteRef.current = true;
      setIsVisiblyLoading(false);
      return;
    }
    
    if (pendingConversations.length === 0 || updatePendingRef.current) return;
    
    logger.info("New conversations available to display", { count: pendingConversations.length });
    
    // Don't update too frequently
    const now = Date.now();
    if (now - lastDisplayUpdateRef.current < 300) {
      if (!updatePendingRef.current) {
        updatePendingRef.current = true;
        setTimeout(() => {
          setDisplayedConversations(pendingConversations);
          initialLoadCompleteRef.current = true;
          setIsVisiblyLoading(false);
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
    setIsVisiblyLoading(false);
    lastDisplayUpdateRef.current = now;
    
    // Cache the conversations if they're valid
    if (currentProfileId && pendingConversations.length > 0) {
      cacheConversations(currentProfileId, pendingConversations);
      logger.info("Updated displayed conversations and cache", { count: pendingConversations.length });
    }
  }, [pendingConversations, currentProfileId, cacheConversations, logger, conversationsLoading]);

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
        logger.info("Cache cleared for forced refresh");
      }
      
      // Call fetchConversations to refresh data
      await fetchConversations(!useCache); // Force fresh fetch if not using cache
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
