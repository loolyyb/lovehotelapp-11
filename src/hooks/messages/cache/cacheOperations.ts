
import { logger } from "@/services/LogService";
import { MessageCacheStore } from "./messageCacheStore";
import { MAX_CACHE_AGE_MS, getCacheKey } from "./cacheSettings";

/**
 * Core cache operations for adding and retrieving messages
 * with optimized performance
 */
export const CacheOperations = {
  /**
   * Add a single message to the cache
   * @returns boolean indicating whether the operation was successful
   */
  addMessage(conversationId: string, message: any): boolean {
    if (!conversationId || !message) return false;
    
    const cacheKey = getCacheKey(conversationId);
    const cached = MessageCacheStore._cache.get(cacheKey);
    
    if (!cached) {
      // If no cache exists yet, create a new entry
      MessageCacheStore.set(conversationId, [message]);
      return true;
    }
    
    // Check if message already exists to prevent duplicates
    // Use a Set for O(1) lookup performance on large message lists
    const messageIds = new Set(cached.messages.map(msg => msg.id));
    
    if (!messageIds.has(message.id)) {
      cached.messages.push(message);
      cached.timestamp = Date.now();
      // Update the cache entry to refresh the LRU position
      MessageCacheStore._cache.set(cacheKey, cached);
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
    
    const cacheKey = getCacheKey(conversationId);
    const cached = MessageCacheStore._cache.get(cacheKey);
    
    if (!cached) return undefined;
    
    // Check if cache is still valid (not too old)
    if (Date.now() - cached.timestamp > MAX_CACHE_AGE_MS) {
      logger.info("Cache expired for conversation", { conversationId });
      MessageCacheStore._cache.delete(cacheKey);
      return undefined;
    }
    
    // Update timestamp on access to refresh LRU status
    cached.timestamp = Date.now();
    MessageCacheStore._cache.set(cacheKey, cached);
    
    return cached.messages;
  }
};
