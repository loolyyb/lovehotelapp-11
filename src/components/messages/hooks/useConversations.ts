
import { useState, useEffect } from "react";
import { useLogger } from "@/hooks/useLogger";
import { useStableConversations } from "@/hooks/conversations/useStableConversations";

/**
 * A wrapper hook for useStableConversations that provides a simplified interface
 * for components that only need basic conversation functionality.
 */
export function useConversations() {
  const logger = useLogger("useConversations");
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    conversations,
    isLoading,
    isRefreshing,
    error,
    refreshConversations,
    currentProfileId
  } = useStableConversations();

  useEffect(() => {
    if (!isInitialized && conversations) {
      logger.info("Conversations initialized", { count: conversations.length });
      setIsInitialized(true);
    }
  }, [conversations, isInitialized, logger]);

  return {
    conversations,
    isLoading,
    isRefreshing,
    error,
    refreshConversations,
    currentProfileId,
    isInitialized
  };
}
