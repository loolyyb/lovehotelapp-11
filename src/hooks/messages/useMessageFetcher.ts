
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";

interface UseMessageFetcherProps {
  conversationId: string;
  currentProfileId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  toast: any;
}

// Cache for messages to reduce database queries
const messagesCache = new Map<string, any[]>();

export const useMessageFetcher = ({ 
  conversationId, 
  currentProfileId, 
  setMessages, 
  toast 
}: UseMessageFetcherProps) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  
  // Default page size
  const PAGE_SIZE = 20;

  const fetchMessages = async (useCache = true) => {
    if (!conversationId || !currentProfileId) {
      logger.info("Cannot fetch messages: missing ID", { 
        hasConversationId: !!conversationId, 
        hasProfileId: !!currentProfileId,
        component: "useMessageFetcher" 
      });
      return null;
    }

    // Try to get from cache first if allowed
    const cacheKey = `${conversationId}_messages`;
    if (useCache && messagesCache.has(cacheKey)) {
      logger.info("Using cached messages", {
        conversationId,
        cachedCount: messagesCache.get(cacheKey)?.length || 0,
        component: "useMessageFetcher"
      });
      
      const cachedMessages = messagesCache.get(cacheKey);
      setMessages(cachedMessages || []);
      return cachedMessages;
    }

    try {
      logger.info("Fetching messages", { 
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
        messagesCache.set(cacheKey, messagesData);
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
    }
  };

  const fetchMoreMessages = async () => {
    if (!conversationId || !currentProfileId || !hasMoreMessages || isLoadingMore) return;

    setIsLoadingMore(true);
    
    try {
      // Get current messages to determine the offset
      const currentMessages = messagesCache.get(`${conversationId}_messages`) || [];
      
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
        const cacheKey = `${conversationId}_messages`;
        const updatedMessages = [...(messagesCache.get(cacheKey) || []), ...olderMessages];
        messagesCache.set(cacheKey, updatedMessages);
        
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
  };

  // Method to add a new message to the cache
  const addMessageToCache = (message: any) => {
    const cacheKey = `${conversationId}_messages`;
    if (messagesCache.has(cacheKey)) {
      const currentMessages = messagesCache.get(cacheKey) || [];
      messagesCache.set(cacheKey, [...currentMessages, message]);
      
      // Also update the state
      setMessages(prev => [...prev, message]);
    }
  };

  // Clear the cache when needed (e.g., on logout)
  const clearCache = () => {
    messagesCache.clear();
  };

  return { 
    fetchMessages, 
    fetchMoreMessages, 
    addMessageToCache, 
    clearCache, 
    isLoadingMore, 
    hasMoreMessages 
  };
};
