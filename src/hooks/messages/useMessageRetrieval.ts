
import { useMessageFetcher } from "./useMessageFetcher";
import { useMessageMarker } from "./useMessageMarker";
import { useState, useCallback } from "react";

interface UseMessageRetrievalProps {
  conversationId: string;
  currentProfileId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  toast: any;
}

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
    isLoadingMore, 
    hasMoreMessages 
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
    const result = await fetchMessages(useCache);
    
    // Add delay before marking messages as read
    if (result && result.length > 0) {
      setTimeout(() => markMessagesAsRead(), 1000);
    }
    
    return result;
  }, [fetchMessages, markMessagesAsRead]);
  
  // Load more messages with debounce to prevent multiple calls
  const loadMoreMessages = useCallback(async () => {
    if (isFetchingMore || !hasMoreMessages) return;
    
    setIsFetchingMore(true);
    
    try {
      await fetchMoreMessages();
    } finally {
      // Add a slight delay to prevent rapid sequential requests
      setTimeout(() => {
        setIsFetchingMore(false);
      }, 500);
    }
  }, [fetchMoreMessages, hasMoreMessages, isFetchingMore]);

  return { 
    fetchMessages: fetchMessagesAndMarkAsRead,
    loadMoreMessages,
    markMessagesAsRead,
    addMessageToCache,
    clearCache,
    isLoadingMore,
    hasMoreMessages,
    isFetchingMore
  };
};
