
import { logger } from "@/services/LogService";
import { CachedData, MessageCacheMap } from "./cacheTypes";
import { MAX_CACHE_SIZE, getCacheKey } from "./cacheSettings";

// Cache for messages to reduce database queries
const messagesCache: MessageCacheMap = new Map<string, CachedData>();

/**
 * Message cache store - handles the actual cache operations
 */
export const MessageCacheStore = {
  /**
   * Get the raw cache map
   */
  getCache(): MessageCacheMap {
    return messagesCache;
  },

  /**
   * Get cached messages for a conversation
   */
  get(conversationId: string): any[] | undefined {
    const cacheKey = getCacheKey(conversationId);
    const cached = messagesCache.get(cacheKey);
    
    if (!cached) return undefined;
    
    // Update timestamp on access to implement LRU behavior
    cached.timestamp = Date.now();
    return cached.messages;
  },

  /**
   * Store messages in cache with timestamp
   */
  set(conversationId: string, messages: any[]): void {
    const cacheKey = getCacheKey(conversationId);
    
    // Store with current timestamp
    messagesCache.set(cacheKey, {
      messages,
      timestamp: Date.now()
    });
    
    // Clean up old entries if cache is too large
    if (messagesCache.size > MAX_CACHE_SIZE) {
      this.cleanOldestEntries();
    }
  },

  /**
   * Check if a conversation has cached messages
   */
  has(conversationId: string): boolean {
    const cacheKey = getCacheKey(conversationId);
    return messagesCache.has(cacheKey);
  },

  /**
   * Remove a specific conversation from cache
   */
  delete(conversationId: string): boolean {
    const cacheKey = getCacheKey(conversationId);
    return messagesCache.delete(cacheKey);
  },

  /**
   * Clear the entire cache
   */
  clear(): void {
    messagesCache.clear();
    logger.info("Message cache cleared");
  },

  /**
   * Helper function to remove oldest entries based on access timestamp
   */
  cleanOldestEntries(): void {
    // Sort by timestamp and remove oldest entries
    const entries = Array.from(messagesCache.entries());
    
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 25% of entries
    const removeCount = Math.max(1, Math.floor(messagesCache.size * 0.25));
    
    for (let i = 0; i < removeCount; i++) {
      if (entries[i]) {
        messagesCache.delete(entries[i][0]);
      }
    }
    
    logger.info(`Cleaned ${removeCount} old cache entries`);
  }
};
