
import { useState, useEffect, useCallback } from "react";
import { useLogger } from "@/hooks/useLogger";
import { useConversationsFetcher } from "./useConversationsFetcher";
import { useProfileState } from "@/hooks/useProfileState";

export function useStableConversations() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const logger = useLogger("useStableConversations");
  const { profileId, isInitialized } = useProfileState();
  
  const {
    conversations,
    setConversations,
    isLoading,
    error,
    fetchConversations,
    loadMoreConversations,
    hasMore
  } = useConversationsFetcher(profileId);

  // Function to refresh conversations with offline support
  const refreshConversations = useCallback(async (showLoadingState = false) => {
    if (!profileId) {
      logger.warn("Cannot refresh conversations without a profile ID");
      return;
    }
    
    try {
      setIsRefreshing(true);
      
      if (showLoadingState) {
        logger.info("Refreshing conversations with loading state");
      } else {
        logger.info("Refreshing conversations in background");
      }
      
      const result = await fetchConversations(true);
      logger.info("Conversations refreshed successfully", { count: result?.length || 0 });
      
      return result;
    } catch (error) {
      logger.error("Error refreshing conversations", { error });
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [profileId, fetchConversations, logger]);

  // Effect to automatically refresh conversations when profile changes
  useEffect(() => {
    if (profileId && isInitialized) {
      logger.info("Profile state initialized, fetching conversations", { profileId });
      fetchConversations(false)
        .catch(error => {
          logger.error("Error in automatic conversation fetch", { error });
        });
    }
  }, [profileId, isInitialized, fetchConversations, logger]);

  // Refresh conversations at regular intervals if we have a profile
  useEffect(() => {
    if (!profileId) return;
    
    const intervalId = setInterval(() => {
      logger.info("Running periodic conversations refresh");
      refreshConversations(false).catch(err => {
        logger.warn("Error in periodic conversations refresh", { error: err });
      });
    }, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [profileId, refreshConversations, logger]);

  return {
    conversations,
    isLoading,
    isRefreshing,
    error,
    refreshConversations,
    loadMoreConversations,
    hasMore,
    currentProfileId: profileId,
    setConversations
  };
}
