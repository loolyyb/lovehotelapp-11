
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
    if (!conversationId || !message || !message.id) {
      logger.warn("Invalid parameters for addMessage", { 
        hasConversationId: !!conversationId, 
        hasMessage: !!message,
        hasMessageId: message?.id
      });
      return false;
    }
    
    // Get existing messages for the conversation
    const existingMessages = MessageCacheStore.get(conversationId) || [];
    
    // Check if message already exists to avoid duplicates
    if (existingMessages.some(m => m.id === message.id)) {
      logger.info("Message already exists in cache, skipping", { 
        messageId: message.id,
        conversationId
      });
      return false;
    }
    
    logger.info("Adding message to cache", { 
      messageId: message.id,
      conversationId
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
