
import { MessageCacheStore } from "./messageCacheStore";
import { CacheOperations } from "./cacheOperations";
import { CacheSyncOperations } from "./cacheSyncOperations";
import { MAX_CACHE_AGE_MS, MAX_CACHE_SIZE } from "./cacheSettings";

/**
 * Message Cache System
 * 
 * Optimized cache management for messages to reduce database queries
 * and improve UI responsiveness.
 */
export const MessageCache = {
  // Get messages from cache
  get: MessageCacheStore.get.bind(MessageCacheStore),
  
  // Store messages in cache
  set: MessageCacheStore.set.bind(MessageCacheStore),
  
  // Add a single message to cache
  addMessage: CacheOperations.addMessage,
  
  // Check if messages are in cache
  has: MessageCacheStore.has.bind(MessageCacheStore),
  
  // Clear all cached messages
  clearAll: MessageCacheStore.clear.bind(MessageCacheStore),
  
  // Clear messages for a specific conversation
  clearConversation: MessageCacheStore.delete.bind(MessageCacheStore),
  
  // Check for newer messages and update cache
  checkForNewerMessages: CacheSyncOperations.checkForNewerMessages,
  
  // Get statistics about the cache for debugging
  getStats: () => {
    const cache = MessageCacheStore.getCache();
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
      maxSize: MAX_CACHE_SIZE,
      maxAge: MAX_CACHE_AGE_MS
    };
  }
};

// Also export the original operations for direct access
export {
  MessageCacheStore,
  CacheOperations,
  CacheSyncOperations
};
