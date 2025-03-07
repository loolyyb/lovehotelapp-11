
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";
import { MessageCache } from './cache/messageCache';

interface UseMessageFetcherProps {
  conversationId: string;
  currentProfileId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  toast: any;
}

/**
 * Hook for message fetching operations
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
  
  // Default page size
  const PAGE_SIZE = 20;

  const fetchMessages = useCallback(async (useCache = true) => {
    if (!conversationId || !currentProfileId) {
      logger.info("Cannot fetch messages: missing ID", { 
        hasConversationId: !!conversationId, 
        hasProfileId: !!currentProfileId,
        component: "useMessageFetcher" 
      });
      return null;
    }

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
      // Try to get from cache first if allowed
      if (useCache && MessageCache.has(conversationId)) {
        logger.info("Using cached messages", {
          conversationId,
          cachedCount: MessageCache.get(conversationId)?.length || 0,
          component: "useMessageFetcher"
        });
        
        const cachedMessages = MessageCache.get(conversationId);
        if (cachedMessages) {
          setMessages(cachedMessages);
          return cachedMessages;
        }
      }

      logger.info("Fetching messages from database", { 
        conversationId, 
        currentProfileId,
        component: "useMessageFetcher" 
      });
      
      // Fetch messages with pagination - RLS policies will handle access control
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read_at,
          sender_id,
          conversation_id,
          media_type,
          media_url,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE)
        .order('created_at', { ascending: true });
      
      if (error) {
        logger.error("Error fetching messages", { 
          error, 
          conversationId,
          component: "useMessageFetcher" 
        });
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les messages",
        });
        return null;
      }
      
      logger.info("Successfully fetched messages", { 
        count: messagesData?.length || 0, 
        conversationId,
        component: "useMessageFetcher" 
      });
      
      // Cache the results
      if (messagesData) {
        MessageCache.set(conversationId, messagesData);
      }
      
      setMessages(messagesData || []);
      setHasMoreMessages(messagesData?.length === PAGE_SIZE);
      return messagesData;
    } catch (error: any) {
      logger.error("Network error fetching messages", {
        error: error.message,
        stack: error.stack,
        component: "useMessageFetcher"
      });
      AlertService.captureException(error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Problème lors du chargement des messages. Veuillez réessayer.",
      });
      return null;
    } finally {
      setFetchInProgress(false);
    }
  }, [conversationId, currentProfileId, setMessages, toast, fetchInProgress]);

  const fetchMoreMessages = useCallback(async () => {
    if (!conversationId || !currentProfileId || !hasMoreMessages || isLoadingMore) return;

    setIsLoadingMore(true);
    
    try {
      // Get current messages to determine the offset
      const currentMessages = MessageCache.get(conversationId) || [];
      
      logger.info("Fetching more messages", { 
        conversationId, 
        currentCount: currentMessages.length,
        component: "useMessageFetcher" 
      });
      
      // Fetch older messages using created_at as cursor
      let query = supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read_at,
          sender_id,
          conversation_id,
          media_type,
          media_url,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });
      
      // Use cursor pagination if we have messages
      if (currentMessages.length > 0) {
        const oldestMessage = [...currentMessages].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )[0];
        
        if (oldestMessage) {
          query = query.lt('created_at', oldestMessage.created_at);
        }
      }
      
      const { data: olderMessages, error } = await query
        .limit(PAGE_SIZE)
        .order('created_at', { ascending: true });
      
      if (error) {
        logger.error("Error fetching more messages", { 
          error, 
          conversationId,
          component: "useMessageFetcher" 
        });
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger plus de messages",
        });
        return null;
      }
      
      logger.info("Successfully fetched more messages", { 
        count: olderMessages?.length || 0, 
        conversationId,
        component: "useMessageFetcher" 
      });
      
      if (olderMessages && olderMessages.length > 0) {
        // Update the cache with new messages
        const updatedMessages = [...(MessageCache.get(conversationId) || []), ...olderMessages];
        MessageCache.set(conversationId, updatedMessages);
        
        // Update state
        setMessages(updatedMessages);
        setHasMoreMessages(olderMessages.length === PAGE_SIZE);
      } else {
        setHasMoreMessages(false);
      }
      
      return olderMessages;
    } catch (error: any) {
      logger.error("Network error fetching more messages", {
        error: error.message,
        stack: error.stack,
        component: "useMessageFetcher"
      });
      AlertService.captureException(error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Problème lors du chargement des messages supplémentaires.",
      });
      return null;
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, currentProfileId, hasMoreMessages, isLoadingMore, setMessages, toast]);

  // Method to add a new message to the cache
  const addMessageToCache = useCallback((message: any) => {
    if (!conversationId) return;
    
    if (MessageCache.has(conversationId)) {
      // Add to cache
      MessageCache.addMessage(conversationId, message);
      
      // Also update the state
      setMessages(prev => {
        // Prevent duplicates in state as well
        if (prev.some(msg => msg.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    }
  }, [conversationId, setMessages]);

  // Clear the cache when needed (e.g., on logout)
  const clearCache = useCallback(() => {
    MessageCache.clearAll();
  }, []);

  return { 
    fetchMessages, 
    fetchMoreMessages, 
    addMessageToCache, 
    clearCache, 
    isLoadingMore, 
    hasMoreMessages,
    fetchInProgress
  };
};
