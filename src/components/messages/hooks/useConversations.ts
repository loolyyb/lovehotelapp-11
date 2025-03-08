
import { useState, useEffect } from "react";
import { useStableConversations } from "@/hooks/conversations/useStableConversations";
import { useLogger } from "@/hooks/useLogger";

/**
 * A simplified hook for accessing conversations with initialization status
 */
export function useConversations() {
  const [isInitialized, setIsInitialized] = useState(false);
  const logger = useLogger("useConversations");
  
  const {
    conversations,
    isLoading,
    isRefreshing,
    error,
    refreshConversations,
    currentProfileId
  } = useStableConversations();
  
  // Set initialized after first load
  useEffect(() => {
    if (!isLoading && currentProfileId) {
      if (!isInitialized) {
        logger.info("Conversations initialized", { count: conversations.length });
        setIsInitialized(true);
      }
    }
  }, [isLoading, conversations, currentProfileId, isInitialized, logger]);
  
  return {
    conversations,
    isLoading,
    isRefreshing,
    error,
    refreshConversations,
    isInitialized,
    currentProfileId
  };
}
