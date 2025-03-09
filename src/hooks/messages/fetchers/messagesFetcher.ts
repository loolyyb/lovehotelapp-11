import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";
import { MessageCache } from '../cache';

// Constants for pagination
const INITIAL_PAGE_SIZE = 15;
const PAGINATION_SIZE = 10;
const DEBOUNCE_TIME = 300; // ms
const THROTTLE_TIME = 2000; // ms - increased to prevent too frequent API calls
const MAX_RETRY_ATTEMPTS = 3;

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

    // Reset back-off - we want to allow new attempts
    this.resetFailedAttempts(conversationId);

    // Track last time we fetched as a debug point
    const now = Date.now();
    const lastFetchTime = lastFetchTimes.get(conversationId) || 0;
    lastFetchTimes.set(conversationId, now);
    
    // Log fetch attempt with more details
    logger.info("Fetching messages attempt started", {
      conversationId,
      currentProfileId,
      timeSinceLastFetch: now - lastFetchTime,
      useCache,
      component: "messagesFetcher"
    });
    
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
      
      // Create a new query with multiple fallback approaches
      const queryPromise = (async () => {
        try {
          // First verify the user has permission to access this conversation
          const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('user1_id, user2_id, status')
            .eq('id', conversationId)
            .maybeSingle();
            
          if (convError) {
            logger.error("Error verifying conversation access", {
              error: convError,
              conversationId,
              component: "messagesFetcher"
            });
            
            // Try an alternative approach - direct message query without join
            logger.info("Attempting direct message fetch due to conversation access error", {
              conversationId,
              component: "messagesFetcher"
            });
            
            const { data: directMessages, error: directError } = await supabase
              .from('messages')
              .select(`
                id, 
                content, 
                created_at, 
                read_at, 
                sender_id, 
                conversation_id,
                media_type,
                media_url
              `)
              .eq('conversation_id', conversationId)
              .order('created_at', { ascending: true })
              .limit(INITIAL_PAGE_SIZE);
              
            if (directError || !directMessages) {
              logger.error("Both conversation and direct message fetches failed", {
                convError,
                directError,
                conversationId,
                component: "messagesFetcher"
              });
              return null;
            }
            
            logger.info("Direct message fetch succeeded despite conversation access error", {
              count: directMessages.length,
              conversationId,
              component: "messagesFetcher"
            });
            
            // We need to enhance with profile data
            const enrichedMessages = await this.enrichMessagesWithProfiles(directMessages);
            
            // Cache the results
            if (enrichedMessages && enrichedMessages.length > 0) {
              MessageCache.set(conversationId, enrichedMessages);
            }
            
            return enrichedMessages;
          }
            
          // Check if user is part of this conversation
          if (!conversation || conversation.status !== 'active' || 
              (conversation.user1_id !== currentProfileId && conversation.user2_id !== currentProfileId)) {
            logger.error("Access denied: User not part of conversation or conversation not active", {
              conversationId,
              currentProfileId,
              conversation,
              component: "messagesFetcher"
            });
            
            // Even though access is denied, try direct fetch as a desperate measure
            try {
              logger.info("Attempting desperate direct fetch despite access denial", {
                conversationId,
                component: "messagesFetcher"
              });
              
              const { data: directMessages } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })
                .limit(INITIAL_PAGE_SIZE);
                
              if (directMessages && directMessages.length > 0) {
                logger.info("Desperate fetch succeeded despite access denial!", {
                  count: directMessages.length,
                  conversationId,
                  component: "messagesFetcher"
                });
                
                const enrichedMessages = await this.enrichMessagesWithProfiles(directMessages);
                return enrichedMessages;
              }
            } catch (e) {
              // Just suppress this error, we tried our best
            }
            
            return null;
          }
          
          // Debug log the conversation details
          logger.info("Conversation access verified", {
            conversationId,
            user1_id: conversation.user1_id,
            user2_id: conversation.user2_id,
            currentProfileId,
            component: "messagesFetcher"
          });
          
          // Try optimized query with joins
          try {
            logger.info("Fetching messages with join", {
              conversationId,
              component: "messagesFetcher"
            });
            
            const { data: messagesData, error } = await supabase
              .from('messages')
              .select(MESSAGE_FIELDS)
              .eq('conversation_id', conversationId)
              .order('created_at', { ascending: false })
              .limit(INITIAL_PAGE_SIZE);
              
            if (error) {
              throw error;
            }
            
            // Success - reset failed attempts counter
            this.resetFailedAttempts(conversationId);
            
            // Now sort in ascending order for display - this avoids a double sort in the DB
            const sortedMessages = messagesData ? 
              [...messagesData].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              ) : [];
            
            logger.info("Successfully fetched messages with join", { 
              count: sortedMessages?.length || 0, 
              conversationId,
              firstMessage: sortedMessages[0]?.id,
              component: "messagesFetcher" 
            });
            
            // Cache the results
            if (sortedMessages && sortedMessages.length > 0) {
              MessageCache.set(conversationId, sortedMessages);
            }
            
            return sortedMessages || [];
          } catch (joinError) {
            // Increment failed attempts counter
            const attempts = (failedAttempts.get(conversationId) || 0) + 1;
            failedAttempts.set(conversationId, attempts);
            
            logger.error("Error fetching messages with join", { 
              error: joinError, 
              conversationId,
              attempts,
              component: "messagesFetcher" 
            });
            
            // Try fallback approach with simpler query
            return await this.fetchMessagesWithFallback(conversationId, currentProfileId);
          }
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
          
          // Try fallback as a last resort
          return await this.fetchMessagesWithFallback(conversationId, currentProfileId);
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
    } catch (outerError: any) {
      logger.error("Unhandled error in fetchInitialMessages", {
        error: outerError.message,
        stack: outerError.stack,
        component: "messagesFetcher"
      });
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
  },
  
  /**
   * Fallback method for fetching messages when the optimized approach fails
   */
  async fetchMessagesWithFallback(
    conversationId: string,
    currentProfileId: string | null
  ): Promise<any[] | null> {
    logger.info("Attempting fallback approach for messages", {
      conversationId,
      component: "messagesFetcher"
    });
    
    try {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('messages')
        .select(`
          id, 
          content, 
          created_at, 
          read_at, 
          sender_id, 
          conversation_id,
          media_type,
          media_url
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(INITIAL_PAGE_SIZE);
        
      if (fallbackError || !fallbackData) {
        logger.error("Fallback approach failed", {
          error: fallbackError,
          conversationId,
          component: "messagesFetcher"
        });
        
        // Try one more approach - direct RPC call or simplified query
        logger.info("Attempting final fallback with direct query", {
          conversationId,
          component: "messagesFetcher"
        });
        
        // Get messages directly with simpler query
        try {
          const { data: directData, error: directError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(INITIAL_PAGE_SIZE);
          
          if (directError || !directData) {
            logger.error("All fallback methods failed", {
              error: directError,
              conversationId,
              component: "messagesFetcher"
            });
            return null;
          }
          
          logger.info("Final fallback succeeded", {
            count: directData.length,
            conversationId,
            component: "messagesFetcher"
          });
          
          // We need to enhance with profile data
          const enrichedMessages = await this.enrichMessagesWithProfiles(directData);
          
          // Cache the results
          if (enrichedMessages && enrichedMessages.length > 0) {
            MessageCache.set(conversationId, enrichedMessages);
          }
          
          return enrichedMessages;
        } catch (directException) {
          logger.error("Exception in final fallback", {
            error: directException,
            conversationId,
            component: "messagesFetcher"
          });
          return null;
        }
      }
      
      // Manually enrich with sender profiles
      const enrichedMessages = await this.enrichMessagesWithProfiles(fallbackData);
      
      // Now sort in ascending order for display
      const sortedMessages = [...enrichedMessages].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      logger.info("Fallback approach succeeded", {
        count: sortedMessages.length,
        conversationId,
        component: "messagesFetcher"
      });
      
      // Cache the results
      if (sortedMessages && sortedMessages.length > 0) {
        MessageCache.set(conversationId, sortedMessages);
      }
      
      return sortedMessages;
    } catch (fallbackError) {
      logger.error("Exception in fallback approach", {
        error: fallbackError,
        conversationId,
        component: "messagesFetcher"
      });
      return null;
    }
  },
  
  /**
   * Enrich messages with profile data
   */
  async enrichMessagesWithProfiles(messages: any[]): Promise<any[]> {
    if (!messages || messages.length === 0) return [];
    
    try {
      // Get unique sender IDs
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      
      // Fetch all profiles in one request
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', senderIds);
      
      // Create a map for quick lookup
      const profileMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profileMap.set(profile.id, profile);
        });
      }
      
      // Enrich each message
      return messages.map(message => ({
        ...message,
        sender: profileMap.get(message.sender_id) || { 
          id: message.sender_id,
          username: 'Unknown User'
        }
      }));
    } catch (error) {
      logger.error("Error enriching messages with profiles", {
        error,
        component: "messagesFetcher"
      });
      
      // Return messages without enrichment rather than failing
      return messages.map(message => ({
        ...message,
        sender: { 
          id: message.sender_id,
          username: 'Unknown User'
        }
      }));
    }
  }
};
