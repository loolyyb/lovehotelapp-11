
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";
import { MessageCache } from '../cache';

// Constants for pagination
const INITIAL_PAGE_SIZE = 15;
const PAGINATION_SIZE = 10;

// Optimization: Only select fields we need to reduce payload size
const MESSAGE_FIELDS = `
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
`;

// In-memory query debounce tracking
const pendingQueries = new Map<string, Promise<any[] | null>>();

/**
 * Message fetching functions with optimized database queries
 * and enhanced caching
 */
export const MessagesFetcher = {
  /**
   * Fetch initial messages for a conversation with query deduplication
   */
  fetchInitialMessages: async (
    conversationId: string,
    currentProfileId: string | null,
    useCache = true
  ): Promise<any[] | null> {
    if (!conversationId || !currentProfileId) {
      logger.info("Cannot fetch messages: missing ID", { 
        hasConversationId: !!conversationId, 
        hasProfileId: !!currentProfileId,
        component: "messagesFetcher" 
      });
      return null;
    }

    // Unique query ID to deduplicate concurrent requests
    const queryId = `init_${conversationId}_${Date.now()}`;
    
    try {
      // Try to get from cache first if allowed
      if (useCache && MessageCache.has(conversationId)) {
        logger.info("Using cached messages", {
          conversationId,
          cachedCount: MessageCache.get(conversationId)?.length || 0,
          component: "messagesFetcher"
        });
        
        const cachedMessages = MessageCache.get(conversationId);
        if (cachedMessages && cachedMessages.length > 0) {
          // Check for newer messages in the background after a short delay
          // but don't block UI rendering
          setTimeout(() => {
            MessageCache.checkForNewerMessages(supabase, conversationId, cachedMessages);
          }, 200);
          
          return cachedMessages;
        }
      }

      // Check if a query is already in progress for this conversation
      if (pendingQueries.has(conversationId)) {
        logger.info("Reusing in-progress query", { 
          conversationId, 
          component: "messagesFetcher" 
        });
        return pendingQueries.get(conversationId);
      }

      logger.info("Fetching messages from database", { 
        conversationId, 
        currentProfileId,
        component: "messagesFetcher" 
      });
      
      // Create a new query and store the promise
      const queryPromise = (async () => {
        try {
          // Optimize query to select only necessary fields and limit result size
          const { data: messagesData, error } = await supabase
            .from('messages')
            .select(MESSAGE_FIELDS)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(INITIAL_PAGE_SIZE)
            .order('created_at', { ascending: true });
          
          if (error) {
            logger.error("Error fetching messages", { 
              error, 
              conversationId,
              component: "messagesFetcher" 
            });
            return null;
          }
          
          logger.info("Successfully fetched messages", { 
            count: messagesData?.length || 0, 
            conversationId,
            component: "messagesFetcher" 
          });
          
          // Cache the results
          if (messagesData) {
            MessageCache.set(conversationId, messagesData);
          }
          
          return messagesData || [];
        } finally {
          // Remove from pending queries after a short delay
          // This prevents immediate duplicate requests but allows
          // new requests after a reasonable time
          setTimeout(() => {
            pendingQueries.delete(conversationId);
          }, 300);
        }
      })();
      
      // Store the promise to deduplicate concurrent requests
      pendingQueries.set(conversationId, queryPromise);
      return await queryPromise;
    } catch (error: any) {
      logger.error("Network error fetching messages", {
        error: error.message,
        stack: error.stack,
        component: "messagesFetcher"
      });
      AlertService.captureException(error);
      pendingQueries.delete(conversationId);
      return null;
    }
  },

  /**
   * Fetch more (older) messages for a conversation
   */
  fetchMoreMessages: async (
    conversationId: string,
    currentProfileId: string | null,
    hasMoreMessages: boolean
  ): Promise<any[] | null> {
    if (!conversationId || !currentProfileId || !hasMoreMessages) return null;
    
    try {
      // Get current messages to determine the offset
      const currentMessages = MessageCache.get(conversationId) || [];
      
      logger.info("Fetching more messages", { 
        conversationId, 
        currentCount: currentMessages.length,
        component: "messagesFetcher" 
      });
      
      // Find the oldest message we have
      if (currentMessages.length === 0) {
        return null;
      }
      
      const oldestMessage = [...currentMessages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )[0];
      
      // Fetch older messages with optimized query
      const { data: olderMessages, error } = await supabase
        .from('messages')
        .select(MESSAGE_FIELDS)
        .eq('conversation_id', conversationId)
        .lt('created_at', oldestMessage.created_at)
        .order('created_at', { ascending: false })
        .limit(PAGINATION_SIZE)
        .order('created_at', { ascending: true });
      
      if (error) {
        logger.error("Error fetching more messages", { 
          error, 
          conversationId,
          component: "messagesFetcher" 
        });
        return null;
      }
      
      logger.info("Successfully fetched more messages", { 
        count: olderMessages?.length || 0, 
        conversationId,
        component: "messagesFetcher" 
      });
      
      if (olderMessages && olderMessages.length > 0) {
        // Update the cache with new messages
        const updatedMessages = [...olderMessages, ...currentMessages];
        MessageCache.set(conversationId, updatedMessages);
        return updatedMessages;
      }
      
      return null;
    } catch (error: any) {
      logger.error("Network error fetching more messages", {
        error: error.message,
        stack: error.stack,
        component: "messagesFetcher"
      });
      AlertService.captureException(error);
      return null;
    }
  }
};
