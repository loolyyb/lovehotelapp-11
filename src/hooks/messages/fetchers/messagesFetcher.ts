
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";
import { MessageCache } from '../cache';

// Constants for pagination
const INITIAL_PAGE_SIZE = 15;
const PAGINATION_SIZE = 10;
const DEBOUNCE_TIME = 300; // ms
const THROTTLE_TIME = 2000; // ms - increased to prevent too frequent API calls

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
const lastFetchTimes = new Map<string, number>();
const failedAttempts = new Map<string, number>();
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Message fetching functions with optimized database queries
 * and enhanced caching
 */
export const MessagesFetcher = {
  /**
   * Reset failed attempts counter for a conversation
   */
  resetFailedAttempts(conversationId: string): void {
    failedAttempts.set(conversationId, 0);
  },
  
  /**
   * Check if we should back off from fetching due to too many failed attempts
   */
  shouldBackOff(conversationId: string): boolean {
    const attempts = failedAttempts.get(conversationId) || 0;
    return attempts >= MAX_RETRY_ATTEMPTS;
  },
  
  /**
   * Fetch initial messages for a conversation with query deduplication
   */
  async fetchInitialMessages(
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

    // Check if we should back off due to repeated failures
    if (this.shouldBackOff(conversationId)) {
      logger.warn("Backing off from fetching messages due to repeated failures", {
        conversationId,
        component: "messagesFetcher"
      });
      
      // Reset after a longer period (30 seconds)
      setTimeout(() => {
        this.resetFailedAttempts(conversationId);
      }, 30000);
      
      return null;
    }

    // Throttle requests - no more than one request per conversation every THROTTLE_TIME ms
    const now = Date.now();
    const lastFetchTime = lastFetchTimes.get(conversationId) || 0;
    if (now - lastFetchTime < THROTTLE_TIME && pendingQueries.has(conversationId)) {
      logger.info("Throttling fetch request", { 
        conversationId,
        timeSinceLastFetch: now - lastFetchTime,
        component: "messagesFetcher" 
      });
      return pendingQueries.get(conversationId);
    }
    
    lastFetchTimes.set(conversationId, now);
    
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
            .limit(INITIAL_PAGE_SIZE);
            
          if (error) {
            // Increment failed attempts counter
            const attempts = (failedAttempts.get(conversationId) || 0) + 1;
            failedAttempts.set(conversationId, attempts);
            
            logger.error("Error fetching messages", { 
              error, 
              conversationId,
              attempts,
              component: "messagesFetcher" 
            });
            return null;
          }
          
          // Success - reset failed attempts counter
          this.resetFailedAttempts(conversationId);
          
          // Now sort in ascending order for display - this avoids a double sort in the DB
          const sortedMessages = messagesData ? 
            [...messagesData].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            ) : [];
          
          logger.info("Successfully fetched messages", { 
            count: sortedMessages?.length || 0, 
            conversationId,
            component: "messagesFetcher" 
          });
          
          // Cache the results
          if (sortedMessages && sortedMessages.length > 0) {
            MessageCache.set(conversationId, sortedMessages);
          }
          
          return sortedMessages || [];
        } finally {
          // Remove from pending queries after a short delay
          // This prevents immediate duplicate requests but allows
          // new requests after a reasonable time
          setTimeout(() => {
            pendingQueries.delete(conversationId);
          }, DEBOUNCE_TIME);
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
      
      // Increment failed attempts counter
      const attempts = (failedAttempts.get(conversationId) || 0) + 1;
      failedAttempts.set(conversationId, attempts);
      
      pendingQueries.delete(conversationId);
      return null;
    }
  },

  /**
   * Fetch more (older) messages for a conversation
   */
  async fetchMoreMessages(
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
        .order('created_at', { ascending: true })
        .limit(PAGINATION_SIZE);
      
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
