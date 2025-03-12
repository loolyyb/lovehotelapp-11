
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";
import { MessageCache } from '../cache';

// Constants for pagination
const INITIAL_PAGE_SIZE = 15;
const PAGINATION_SIZE = 10;
const DEBOUNCE_TIME = 1000; // Increased from 300ms to 1000ms
const THROTTLE_TIME = 3000; // Increased from 2000ms to 3000ms
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
    const timeSinceLastFetch = now - lastFetchTime;
    
    // Apply throttling to prevent too frequent refreshes
    if (timeSinceLastFetch < THROTTLE_TIME) {
      logger.info("Throttling message fetch - too soon since last fetch", {
        conversationId,
        timeSinceLastFetch: `${Math.round(timeSinceLastFetch / 1000)}s`,
        throttleTime: `${Math.round(THROTTLE_TIME / 1000)}s`,
        component: "messagesFetcher"
      });
    }
    
    lastFetchTimes.set(conversationId, now);
    
    logger.info("Fetching messages attempt started", {
      conversationId,
      currentProfileId,
      timeSinceLastFetch: `${Math.round(timeSinceLastFetch / 1000)}s`,
      useCache,
      component: "messagesFetcher"
    });
    
    try {
      // Try to get from cache first if allowed
      if (useCache) {
        // Check for any pending request first to avoid duplicate fetches
        const pendingRequest = MessageCache.getPendingRequest(conversationId);
        if (pendingRequest) {
          logger.info("Reusing in-progress query", { 
            conversationId, 
            component: "messagesFetcher" 
          });
          return pendingRequest;
        }
        
        // Try to get from cache
        const cachedMessages = await MessageCache.get(conversationId);
        if (cachedMessages && cachedMessages.length > 0) {
          logger.info("Using cached messages", {
            conversationId,
            cachedCount: cachedMessages.length,
            component: "messagesFetcher"
          });
          
          // Check for newer messages in the background after a short delay
          // but don't block UI rendering
          setTimeout(() => {
            MessageCache.checkForNewerMessages(supabase, conversationId, cachedMessages);
          }, 200);
          
          return cachedMessages;
        }
      }

      logger.info("Fetching messages using database function", { 
        conversationId, 
        currentProfileId,
        component: "messagesFetcher" 
      });
      
      // Create a new query promise
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
            throw convError;
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
            throw new Error("Access denied: User not part of conversation");
          }
          
          // Use the optimized database function
          const { data: messagesData, error } = await supabase.rpc(
            'get_conversation_messages', 
            { 
              conversation_uuid: conversationId,
              limit_count: INITIAL_PAGE_SIZE
            }
          );
              
          if (error) {
            logger.error("Error using get_conversation_messages function", {
              error,
              conversationId,
              component: "messagesFetcher"
            });
            
            // Fall back to direct query if the function fails
            return await this.fetchMessagesWithFallback(conversationId, currentProfileId);
          }
          
          // Success - reset failed attempts counter
          this.resetFailedAttempts(conversationId);
          
          // Now sort in ascending order for display - this avoids a double sort in the DB
          const sortedMessages = messagesData ? 
            [...messagesData].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            ) : [];
          
          logger.info("Successfully fetched messages with database function", { 
            count: sortedMessages?.length || 0, 
            conversationId,
            firstMessageId: sortedMessages[0]?.id,
            component: "messagesFetcher" 
          });
          
          // Cache the results
          if (sortedMessages && sortedMessages.length > 0) {
            await MessageCache.set(conversationId, sortedMessages);
          }
          
          return sortedMessages || [];
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
          
          // Try fallback as a last resort
          return await this.fetchMessagesWithFallback(conversationId, currentProfileId);
        }
      })();
      
      // Register the promise to deduplicate concurrent requests
      MessageCache.registerPendingRequest(conversationId, queryPromise);
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
      const currentMessages = await MessageCache.get(conversationId) || [];
      
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
      
      // Use the database function with timestamp parameter
      const { data: olderMessages, error } = await supabase.rpc(
        'get_conversation_messages',
        {
          conversation_uuid: conversationId,
          limit_count: PAGINATION_SIZE,
          before_timestamp: oldestMessage.created_at
        }
      );
      
      if (error) {
        logger.error("Error fetching more messages with function", { 
          error, 
          conversationId,
          component: "messagesFetcher" 
        });
        
        // Fall back to direct query
        const { data: fallbackMessages, error: fallbackError } = await supabase
          .from('messages')
          .select(MESSAGE_FIELDS)
          .eq('conversation_id', conversationId)
          .lt('created_at', oldestMessage.created_at)
          .order('created_at', { ascending: true })
          .limit(PAGINATION_SIZE);
          
        if (fallbackError || !fallbackMessages) {
          throw fallbackError || new Error("Failed to fetch more messages");
        }
        
        // Process and add to cache
        if (fallbackMessages.length > 0) {
          const updatedMessages = [...fallbackMessages, ...currentMessages];
          await MessageCache.set(conversationId, updatedMessages);
          return updatedMessages;
        }
        
        return null;
      }
      
      logger.info("Successfully fetched more messages", { 
        count: olderMessages?.length || 0, 
        conversationId,
        component: "messagesFetcher" 
      });
      
      if (olderMessages && olderMessages.length > 0) {
        // Sort messages in ascending order
        const sortedOlderMessages = [...olderMessages].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        // Update the cache with new messages
        const updatedMessages = [...sortedOlderMessages, ...currentMessages];
        await MessageCache.set(conversationId, updatedMessages);
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
            await MessageCache.set(conversationId, enrichedMessages);
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
        await MessageCache.set(conversationId, sortedMessages);
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
  },
  
  /**
   * Mark conversation messages as read using the database function
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<number> {
    if (!conversationId || !userId) return 0;
    
    try {
      logger.info("Marking messages as read with function", {
        conversationId,
        userId,
        component: "messagesFetcher"
      });
      
      const { data, error } = await supabase.rpc(
        'mark_conversation_messages_as_read',
        {
          conversation_uuid: conversationId,
          user_uuid: userId
        }
      );
      
      if (error) {
        logger.error("Error marking messages as read with function", {
          error,
          conversationId,
          component: "messagesFetcher"
        });
        
        // Try direct approach
        const { error: directError } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .neq('sender_id', userId)
          .is('read_at', null);
        
        if (directError) {
          throw directError;
        }
        
        return 0; // We don't know how many were updated
      }
      
      return data || 0;
    } catch (error) {
      logger.error("Exception marking messages as read", {
        error,
        conversationId,
        component: "messagesFetcher"
      });
      return 0;
    }
  },
  
  /**
   * Cache warming for frequent conversations
   */
  async warmCache(frequentConversationIds: string[], currentProfileId: string): Promise<void> {
    if (!frequentConversationIds || frequentConversationIds.length === 0 || !currentProfileId) {
      return;
    }
    
    logger.info("Warming cache for frequent conversations", {
      count: frequentConversationIds.length,
      component: "messagesFetcher"
    });
    
    // Collect profiles to prefetch
    const profileIds = new Set<string>();
    
    // Prefetch conversations in the background, one by one to avoid overloading
    for (const conversationId of frequentConversationIds) {
      try {
        // Skip if already in cache
        if (await MessageCache.get(conversationId)) {
          continue;
        }
        
        // Get conversation data to find the other user
        const { data: conversation } = await supabase
          .from('conversations')
          .select('user1_id, user2_id')
          .eq('id', conversationId)
          .single();
        
        if (conversation) {
          // Add the other user's profile to prefetch
          const otherUserId = conversation.user1_id === currentProfileId 
            ? conversation.user2_id 
            : conversation.user1_id;
          
          profileIds.add(otherUserId);
        }
        
        // Fetch messages at low priority
        setTimeout(async () => {
          await this.fetchInitialMessages(conversationId, currentProfileId, true);
        }, 1000); // Delay to avoid impacting UI
      } catch (error) {
        logger.error("Error warming cache for conversation", {
          error,
          conversationId,
          component: "messagesFetcher"
        });
        // Continue with next conversation
      }
    }
    
    // Prefetch profiles
    await MessageCache.prefetchProfiles(supabase, Array.from(profileIds));
  }
};
