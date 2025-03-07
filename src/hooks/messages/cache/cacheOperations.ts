
import { logger } from "@/services/LogService";
import { MessageCacheStore } from "./messageCacheStore";
import { MAX_CACHE_AGE_MS, getCacheKey } from "./cacheSettings";

/**
 * Core cache operations for adding and retrieving messages
 */
export const CacheOperations = {
  /**
   * Add a single message to the cache
   * @returns boolean indicating whether the operation was successful
   */
  addMessage(conversationId: string, message: any): boolean {
    if (!conversationId) return false;
    
    const cache = MessageCacheStore.getCache();
    const cacheKey = getCacheKey(conversationId);
    const cached = cache.get(cacheKey);
    
    if (!cached) {
      // If no cache exists yet, create a new entry
      MessageCacheStore.set(conversationId, [message]);
      return true;
    }
    
    // Check if message already exists to prevent duplicates
    if (!cached.messages.some(msg => msg.id === message.id)) {
      cached.messages.push(message);
      cached.timestamp = Date.now();
      return true;
    }
    
    return false;
  },
  
  /**
   * Get messages from cache, checking validity first
   * @returns messages array or undefined if not in cache or expired
   */
  getMessages(conversationId: string): any[] | undefined {
    if (!conversationId) return undefined;
    
    const cache = MessageCacheStore.getCache();
    const cacheKey = getCacheKey(conversationId);
    const cached = cache.get(cacheKey);
    
    if (!cached) return undefined;
    
    // Check if cache is still valid (not too old)
    if (Date.now() - cached.timestamp > MAX_CACHE_AGE_MS) {
      logger.info("Cache expired for conversation", { conversationId });
      cache.delete(cacheKey);
      return undefined;
    }
    
    // Update timestamp on access
    cached.timestamp = Date.now();
    return cached.messages;
  }
};
