
import { useState, useCallback, useRef } from 'react';
import { MessagesFetcher } from './fetchers/messagesFetcher';
import { MessageCache } from './cache';
import { logger } from "@/services/LogService";

interface UseMessageFetcherProps {
  conversationId: string;
  currentProfileId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  toast: any;
}

/**
 * Hook for message fetching operations with improved performance
 * and reduced re-renders
 */
export const useMessageFetcher = ({ 
  conversationId, 
  currentProfileId, 
  setMessages, 
  toast 
}: UseMessageFetcherProps) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const fetchInProgressRef = useRef(false);

  // Fetch initial messages with concurrency control using a ref
  // This prevents multiple fetches from happening at the same time
  const fetchMessages = useCallback(async (useCache = true) => {
    // Prevent concurrent fetches
    if (fetchInProgressRef.current) {
      logger.info("Fetch already in progress, skipping duplicate request", {
        conversationId,
        component: "useMessageFetcher"
      });
      return null;
    }

    fetchInProgressRef.current = true;

    try {
      const messagesData = await MessagesFetcher.fetchInitialMessages(
        conversationId,
        currentProfileId,
        useCache
      );
      
      if (messagesData) {
        setMessages(messagesData);
        setHasMoreMessages(messagesData.length === 15); // INITIAL_PAGE_SIZE
      } else if (!useCache) {
        // If we explicitly skipped cache but got no results, show empty
        setMessages([]);
        setHasMoreMessages(false);
      }
      
      return messagesData;
    } catch (error) {
      logger.error("Error in fetchMessages", { error });
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les messages",
      });
      return null;
    } finally {
      fetchInProgressRef.current = false;
    }
  }, [conversationId, currentProfileId, setMessages, toast]);

  // Fetch older messages
  const fetchMoreMessages = useCallback(async () => {
    if (!conversationId || !currentProfileId || !hasMoreMessages || isLoadingMore) return null;

    setIsLoadingMore(true);
    
    try {
      const updatedMessages = await MessagesFetcher.fetchMoreMessages(
        conversationId,
        currentProfileId,
        hasMoreMessages
      );
      
      if (updatedMessages) {
        setMessages(updatedMessages);
        setHasMoreMessages(updatedMessages.length > 0 && updatedMessages.length % 10 === 0); // PAGINATION_SIZE
        return updatedMessages;
      } else {
        setHasMoreMessages(false);
        return null;
      }
    } catch (error) {
      logger.error("Error in fetchMoreMessages", { error });
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger plus de messages",
      });
      return null;
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, currentProfileId, hasMoreMessages, isLoadingMore, setMessages, toast]);

  // Add a new message to the cache
  const addMessageToCache = useCallback((message: any) => {
    if (!conversationId) return;
    
    const cacheUpdated = MessageCache.addMessage(conversationId, message);
    
    // Also update the state if cache was updated
    if (cacheUpdated) {
      setMessages(prev => {
        // Prevent duplicates in state
        if (prev.some(msg => msg.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    }
  }, [conversationId, setMessages]);

  // Clear cache helper methods
  const clearCache = useCallback(() => {
    MessageCache.clearAll();
  }, []);

  const clearConversationCache = useCallback((convoId: string) => {
    MessageCache.clearConversation(convoId);
  }, []);

  return { 
    fetchMessages, 
    fetchMoreMessages, 
    addMessageToCache, 
    clearCache,
    clearConversationCache,
    isLoadingMore, 
    hasMoreMessages,
    fetchInProgress: fetchInProgressRef.current
  };
};
