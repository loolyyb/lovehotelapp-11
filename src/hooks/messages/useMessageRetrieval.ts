
import { useState, useCallback, useRef, useEffect } from "react";
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
  const lastAddedMessageRef = useRef<string | null>(null);

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

  // Enhanced addMessageToCache with deduplication
  const enhancedAddMessageToCache = useCallback((message: any) => {
    if (!message || !message.id) return;
    
    // Prevent adding the same message multiple times
    if (lastAddedMessageRef.current === message.id) return;
    lastAddedMessageRef.current = message.id;
    
    // Add to cache
    const result = addMessageToCache(message);
    
    // If successfully added to cache, also update the state
    if (result) {
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    }
    
    // Reset lastAddedMessageRef after a delay to allow re-adding in case of errors
    setTimeout(() => {
      if (lastAddedMessageRef.current === message.id) {
        lastAddedMessageRef.current = null;
      }
    }, 5000);
  }, [addMessageToCache, setMessages]);

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
      }, 1000) as unknown as number;
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
  useEffect(() => {
    return () => {
      if (markAsReadTimerRef.current) {
        window.clearTimeout(markAsReadTimerRef.current);
        markAsReadTimerRef.current = null;
      }
      
      if (loadMoreTimerRef.current) {
        window.clearTimeout(loadMoreTimerRef.current);
        loadMoreTimerRef.current = null;
      }
    };
  }, []);

  return { 
    fetchMessages: fetchMessagesAndMarkAsRead,
    loadMoreMessages,
    markMessagesAsRead,
    addMessageToCache: enhancedAddMessageToCache,
    clearCache,
    clearConversationCache,
    isLoadingMore,
    hasMoreMessages,
    isFetchingMore,
    fetchInProgress
  };
};
