
import { useState, useCallback, useRef } from "react";
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
 * with optimized performance handling
 */
export const useMessageRetrieval = ({ 
  conversationId, 
  currentProfileId, 
  setMessages, 
  toast 
}: UseMessageRetrievalProps) => {
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loadMoreTimerRef = useRef<number | null>(null);
  const markAsReadTimerRef = useRef<number | null>(null);

  // Use the optimized fetcher
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

  // Fetch messages and handle marking as read with debounce
  const fetchMessagesAndMarkAsRead = useCallback(async (useCache = true) => {
    if (!currentProfileId) {
      return null;
    }
    
    // Clear any existing timers
    if (markAsReadTimerRef.current) {
      window.clearTimeout(markAsReadTimerRef.current);
      markAsReadTimerRef.current = null;
    }
    
    const result = await fetchMessages(useCache);
    
    // Add delay before marking messages as read to avoid network congestion
    if (result && result.length > 0) {
      markAsReadTimerRef.current = window.setTimeout(() => {
        markMessagesAsRead();
        markAsReadTimerRef.current = null;
      }, 1200) as unknown as number;
    }
    
    return result;
  }, [fetchMessages, markMessagesAsRead, currentProfileId]);
  
  // Load more messages with debounce and proper state management
  const loadMoreMessages = useCallback(async () => {
    // Prevent multiple load more requests and handle edge cases
    if (isFetchingMore || !hasMoreMessages || !currentProfileId || fetchInProgress) return;
    
    setIsFetchingMore(true);
    
    // Clear existing timer if any
    if (loadMoreTimerRef.current) {
      window.clearTimeout(loadMoreTimerRef.current);
    }
    
    try {
      await fetchMoreMessages();
    } finally {
      // Add a slight delay before allowing another load more request
      loadMoreTimerRef.current = window.setTimeout(() => {
        setIsFetchingMore(false);
        loadMoreTimerRef.current = null;
      }, 500) as unknown as number;
    }
  }, [fetchMoreMessages, hasMoreMessages, isFetchingMore, currentProfileId, fetchInProgress]);

  // Cleanup timers on unmount
  const cleanup = useCallback(() => {
    if (markAsReadTimerRef.current) {
      window.clearTimeout(markAsReadTimerRef.current);
      markAsReadTimerRef.current = null;
    }
    
    if (loadMoreTimerRef.current) {
      window.clearTimeout(loadMoreTimerRef.current);
      loadMoreTimerRef.current = null;
    }
  }, []);

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
    fetchInProgress,
    cleanup
  };
};
