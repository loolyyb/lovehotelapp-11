
import { LRUCache } from 'lru-cache';
import { CachedData, MessageCacheMap } from './cacheTypes';
import { MAX_CACHE_SIZE, MAX_CACHE_AGE_MS, getCacheKey } from './cacheSettings';
import { logger } from "@/services/LogService";

/**
 * MessageCacheStore - Optimized LRU cache implementation for messages
 * with automatic stale data eviction and memory management
 */
export const MessageCacheStore = {
  // Using LRU cache with configured size and TTL for better performance
  _cache: new LRUCache<string, CachedData>({
    max: MAX_CACHE_SIZE,
    ttl: MAX_CACHE_AGE_MS,
    updateAgeOnGet: true,
    updateAgeOnHas: false,
    allowStale: false,
    // Added new options for better performance
    noDisposeOnSet: false,
    disposeAfter: (value, key) => {
      logger.info(`Cache entry expired for key: ${key}`, { component: "MessageCacheStore" });
    }
  }),

  // Get messages from cache with automatic stale check and stats logging
  get(conversationId: string): any[] | undefined {
    if (!conversationId) return undefined;
    
    const cacheKey = getCacheKey(conversationId);
    const cached = this._cache.get(cacheKey);
    
    if (!cached) {
      logger.info(`Cache miss for conversation: ${conversationId}`, { component: "MessageCacheStore" });
      return undefined;
    }
    
    // Update timestamp on access for LRU behavior
    cached.timestamp = Date.now();
    logger.info(`Cache hit for conversation: ${conversationId}, found ${cached.messages.length} messages`, { 
      component: "MessageCacheStore",
      cacheAge: Math.round((Date.now() - cached.timestamp) / 1000) + 's'
    });
    
    return cached.messages;
  },
  
  // Store messages in cache with timestamp
  set(conversationId: string, messages: any[]): void {
    if (!conversationId || !messages) return;
    
    const cacheKey = getCacheKey(conversationId);
    this._cache.set(cacheKey, {
      messages,
      timestamp: Date.now()
    });
    
    logger.info("Cache updated for conversation", { 
      conversationId, 
      messageCount: messages.length, 
      component: "MessageCacheStore",
      cacheSize: this._cache.size
    });
  },
  
  // Check if messages are in cache
  has(conversationId: string): boolean {
    if (!conversationId) return false;
    return this._cache.has(getCacheKey(conversationId));
  },
  
  // Clear the entire cache
  clear(): void {
    this._cache.clear();
    logger.info("Cache cleared", { component: "MessageCacheStore" });
  },
  
  // Delete specific conversation from cache
  delete(conversationId: string): void {
    if (!conversationId) return;
    this._cache.delete(getCacheKey(conversationId));
    logger.info("Cache entry deleted", { conversationId, component: "MessageCacheStore" });
  },
  
  // For diagnostics and testing
  getCache(): MessageCacheMap {
    // Convert LRU cache to Map for compatibility
    const result = new Map<string, CachedData>();
    for (const key of this._cache.keys()) {
      const value = this._cache.get(key);
      if (value) {
        result.set(key, value);
      }
    }
    return result;
  },
  
  // Get cache stats for monitoring
  getStats() {
    return {
      size: this._cache.size,
      maxSize: MAX_CACHE_SIZE,
      itemCount: this._cache.size,
      remaining: MAX_CACHE_SIZE - this._cache.size
    };
  }
};
