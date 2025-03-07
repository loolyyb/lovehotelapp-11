
import { logger } from "@/services/LogService";
import { MessageCacheStore } from "./messageCacheStore";
import { MAX_CACHE_SIZE } from "./cacheSettings";

/**
 * Operations to manipulate the message cache
 */
export const CacheOperations = {
  /**
   * Add a single message to the cache for a conversation
   * with optimized insertion and sorting
   */
  addMessage(conversationId: string, message: any): boolean {
    if (!conversationId || !message) {
      logger.warn("Invalid parameters for addMessage", { 
        hasConversationId: !!conversationId, 
        hasMessage: !!message,
        messageId: message?.id
      });
      return false;
    }
    
    // For optimistic messages without an ID, we can still add them
    if (!message.id && !message.optimistic) {
      logger.warn("Message has no ID and is not optimistic", { 
        conversationId,
        message
      });
      return false;
    }
    
    // Get existing messages for the conversation
    const existingMessages = MessageCacheStore.get(conversationId) || [];
    
    // Check if message already exists to avoid duplicates
    // For optimistic messages, check the content instead of ID
    const isDuplicate = message.id 
      ? existingMessages.some(m => m.id === message.id)
      : existingMessages.some(m => 
          m.optimistic && 
          m.content === message.content && 
          m.sender_id === message.sender_id &&
          Math.abs(new Date(m.created_at).getTime() - new Date(message.created_at).getTime()) < 5000
        );
    
    if (isDuplicate) {
      logger.info("Message already exists in cache, skipping", { 
        messageId: message.id || 'optimistic',
        conversationId
      });
      return false;
    }
    
    logger.info("Adding message to cache", { 
      messageId: message.id || 'optimistic',
      conversationId,
      isOptimistic: !!message.optimistic
    });
    
    // Add new message and sort by creation time
    const updatedMessages = [...existingMessages, message].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Ensure we don't exceed the maximum cache size
    if (updatedMessages.length > MAX_CACHE_SIZE) {
      updatedMessages.splice(0, updatedMessages.length - MAX_CACHE_SIZE);
    }
    
    // Store the updated messages
    MessageCacheStore.set(conversationId, updatedMessages);
    
    return true;
  }
};
