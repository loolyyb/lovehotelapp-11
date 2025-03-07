
import { useState, useCallback, useRef, useEffect } from 'react';
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
  const componentMountedRef = useRef(true);
  const fetchAttemptRef = useRef(0);
  const lastFetchTimeRef = useRef(0);
  const errorDisplayedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    componentMountedRef.current = true;
    return () => {
      componentMountedRef.current = false;
    };
  }, []);

  // Reset fetch state when conversation changes
  useEffect(() => {
    fetchInProgressRef.current = false;
    fetchAttemptRef.current = 0;
    lastFetchTimeRef.current = 0;
    errorDisplayedRef.current = false;
    
    // Reset failed attempts for the new conversation
    if (conversationId) {
      MessagesFetcher.resetFailedAttempts(conversationId);
    }
  }, [conversationId]);

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

    // Throttle rapid successive fetches
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 1000 && fetchAttemptRef.current > 0) {
      logger.info("Throttling rapid fetch requests", {
        timeSinceLastFetch: now - lastFetchTimeRef.current,
        component: "useMessageFetcher"
      });
      return null;
    }

    fetchInProgressRef.current = true;
    lastFetchTimeRef.current = now;
    fetchAttemptRef.current++;

    try {
      // Check if we should back off due to repeated failures
      if (MessagesFetcher.shouldBackOff(conversationId)) {
        if (!errorDisplayedRef.current && componentMountedRef.current) {
          toast({
            variant: "destructive",
            title: "Problème de connexion",
            description: "Impossible de charger les messages. Veuillez vérifier votre connexion Internet et réessayer.",
          });
          errorDisplayedRef.current = true;
        }
        return null;
      }

      const messagesData = await MessagesFetcher.fetchInitialMessages(
        conversationId,
        currentProfileId,
        useCache
      );
      
      if (!componentMountedRef.current) return null;
      
      if (messagesData && messagesData.length > 0) {
        setMessages(messagesData);
        setHasMoreMessages(messagesData.length >= 15); // INITIAL_PAGE_SIZE
        
        // Reset error flag on success
        errorDisplayedRef.current = false;
        
        return messagesData;
      } else if (!useCache) {
        // If we explicitly skipped cache but got no results, show empty
        setMessages([]);
        setHasMoreMessages(false);
      }
      
      return messagesData || [];
    } catch (error) {
      logger.error("Error in fetchMessages", { error });
      if (componentMountedRef.current && !errorDisplayedRef.current) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les messages",
        });
        errorDisplayedRef.current = true;
      }
      return null;
    } finally {
      // Delay clearing the flag slightly to prevent rapid consecutive fetches
      setTimeout(() => {
        if (componentMountedRef.current) {
          fetchInProgressRef.current = false;
        }
      }, 1000);
    }
  }, [conversationId, currentProfileId, setMessages, toast]);

  // Fetch older messages
  const fetchMoreMessages = useCallback(async () => {
    if (!conversationId || !currentProfileId || !hasMoreMessages || isLoadingMore || fetchInProgressRef.current) return null;

    setIsLoadingMore(true);
    
    try {
      const updatedMessages = await MessagesFetcher.fetchMoreMessages(
        conversationId,
        currentProfileId,
        hasMoreMessages
      );
      
      if (!componentMountedRef.current) return null;
      
      if (updatedMessages && updatedMessages.length > 0) {
        setMessages(updatedMessages);
        setHasMoreMessages(updatedMessages.length % 10 === 0); // PAGINATION_SIZE
        return updatedMessages;
      } else {
        setHasMoreMessages(false);
        return null;
      }
    } catch (error) {
      logger.error("Error in fetchMoreMessages", { error });
      if (componentMountedRef.current) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger plus de messages",
        });
      }
      return null;
    } finally {
      if (componentMountedRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [conversationId, currentProfileId, hasMoreMessages, isLoadingMore, setMessages, toast]);

  // Add a new message to the cache
  const addMessageToCache = useCallback((message: any) => {
    if (!conversationId) return;
    
    const cacheUpdated = MessageCache.addMessage(conversationId, message);
    
    // Also update the state if cache was updated
    if (cacheUpdated) {
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
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
