
import { useState, useCallback } from "react";
import { useMessageFetcher } from "./useMessageFetcher";
import { useMessageMarker } from "./useMessageMarker";

interface UseMessageRetrievalProps {
  conversationId: string;
  currentProfileId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  toast: any;
}

/**
 * Main hook that combines message fetching and marking as read functionality
 */
export const useMessageRetrieval = ({ 
  conversationId, 
  currentProfileId, 
  setMessages, 
  toast 
}: UseMessageRetrievalProps) => {
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  const { 
    fetchMessages, 
    fetchMoreMessages, 
    addMessageToCache, 
    clearCache,
    clearConversationCache,
    isLoadingMore, 
    hasMoreMessages,
    fetchInProgress
  } = useMessageFetcher({
    conversationId,
    currentProfileId,
    setMessages,
    toast
  });

  const { markMessagesAsRead } = useMessageMarker({
    conversationId,
    currentProfileId
  });

  // Add delay before marking messages as read after fetching
  const fetchMessagesAndMarkAsRead = useCallback(async (useCache = true) => {
    if (!currentProfileId) {
      return null;
    }
    
    const result = await fetchMessages(useCache);
    
    // Add delay before marking messages as read
    if (result && result.length > 0) {
      setTimeout(() => markMessagesAsRead(), 1000);
    }
    
    return result;
  }, [fetchMessages, markMessagesAsRead, currentProfileId]);
  
  // Load more messages with debounce to prevent multiple calls
  const loadMoreMessages = useCallback(async () => {
    if (isFetchingMore || !hasMoreMessages || !currentProfileId) return;
    
    setIsFetchingMore(true);
    
    try {
      await fetchMoreMessages();
    } finally {
      // Add a slight delay to prevent rapid sequential requests
      setTimeout(() => {
        setIsFetchingMore(false);
      }, 500);
    }
  }, [fetchMoreMessages, hasMoreMessages, isFetchingMore, currentProfileId]);

  return { 
    fetchMessages: fetchMessagesAndMarkAsRead,
    loadMoreMessages,
    markMessagesAsRead,
    addMessageToCache,
    clearCache,
    clearConversationCache,
    isLoadingMore,
    hasMoreMessages,
    isFetchingMore,
    fetchInProgress
  };
};
