
import { useState, useCallback } from 'react';
import { MessagesFetcher } from './fetchers/messagesFetcher';
import { MessageCacheOperations } from './cache/messageCacheOperations';
import { MessageCache } from './cache/messageCache';
import { logger } from "@/services/LogService";

interface UseMessageFetcherProps {
  conversationId: string;
  currentProfileId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  toast: any;
}

/**
 * Hook for message fetching operations with improved performance
 */
export const useMessageFetcher = ({ 
  conversationId, 
  currentProfileId, 
  setMessages, 
  toast 
}: UseMessageFetcherProps) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [fetchInProgress, setFetchInProgress] = useState(false);

  // Fetch initial messages with concurrency control
  const fetchMessages = useCallback(async (useCache = true) => {
    // Prevent concurrent fetches
    if (fetchInProgress) {
      logger.info("Fetch already in progress, skipping duplicate request", {
        conversationId,
        component: "useMessageFetcher"
      });
      return null;
    }

    setFetchInProgress(true);

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
      setFetchInProgress(false);
    }
  }, [conversationId, currentProfileId, setMessages, toast, fetchInProgress]);

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
    
    const cacheUpdated = MessageCacheOperations.addMessageToCache(conversationId, message);
    
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
    MessageCacheOperations.clearCache();
  }, []);

  const clearConversationCache = useCallback((convoId: string) => {
    MessageCacheOperations.clearConversationCache(convoId);
  }, []);

  return { 
    fetchMessages, 
    fetchMoreMessages, 
    addMessageToCache, 
    clearCache,
    clearConversationCache,
    isLoadingMore, 
    hasMoreMessages,
    fetchInProgress
  };
};
