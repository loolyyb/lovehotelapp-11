
/**
 * Enhanced cache utility for messages to reduce database queries
 * with improved performance and memory management
 */

// Set a maximum cache size to prevent memory issues
const MAX_CACHE_SIZE = 50;
const MAX_CACHE_AGE_MS = 10 * 60 * 1000; // 10 minutes

// Cache structure with timestamps to track age
type CachedData = {
  messages: any[];
  timestamp: number;
};

// Cache for messages to reduce database queries
const messagesCache = new Map<string, CachedData>();

/**
 * Message cache utilities to manage cached messages with performance optimizations
 */
export const MessageCache = {
  /**
   * Get messages from cache
   */
  get: (conversationId: string): any[] | undefined => {
    const cacheKey = `${conversationId}_messages`;
    const cached = messagesCache.get(cacheKey);
    
    if (!cached) return undefined;
    
    // Update timestamp on access to implement LRU behavior
    cached.timestamp = Date.now();
    return cached.messages;
  },

  /**
   * Store messages in cache with timestamp
   */
  set: (conversationId: string, messages: any[]): void => {
    const cacheKey = `${conversationId}_messages`;
    
    // Store with current timestamp
    messagesCache.set(cacheKey, {
      messages,
      timestamp: Date.now()
    });
    
    // Clean up old entries if cache is too large
    if (messagesCache.size > MAX_CACHE_SIZE) {
      cleanOldestEntries();
    }
  },

  /**
   * Add a single message to the cache
   */
  addMessage: (conversationId: string, message: any): void => {
    const cacheKey = `${conversationId}_messages`;
    const cached = messagesCache.get(cacheKey);
    
    if (!cached) {
      // If no cache exists yet, create a new entry
      messagesCache.set(cacheKey, {
        messages: [message],
        timestamp: Date.now()
      });
      return;
    }
    
    // Check if message already exists to prevent duplicates
    if (!cached.messages.some(msg => msg.id === message.id)) {
      cached.messages.push(message);
      cached.timestamp = Date.now();
    }
  },

  /**
   * Clear the entire cache
   */
  clearAll: (): void => {
    messagesCache.clear();
  },

  /**
   * Clear cache for a specific conversation
   */
  clearConversation: (conversationId: string): void => {
    const cacheKey = `${conversationId}_messages`;
    messagesCache.delete(cacheKey);
  },

  /**
   * Check if conversation messages are cached
   */
  has: (conversationId: string): boolean => {
    const cacheKey = `${conversationId}_messages`;
    const cached = messagesCache.get(cacheKey);
    
    if (!cached) return false;
    
    // Check if cache is still valid (not too old)
    if (Date.now() - cached.timestamp > MAX_CACHE_AGE_MS) {
      messagesCache.delete(cacheKey);
      return false;
    }
    
    return true;
  },
  
  /**
   * Get cache stats for debugging
   */
  getStats: () => {
    return {
      size: messagesCache.size,
      keys: Array.from(messagesCache.keys())
    };
  }
};

/**
 * Helper function to remove oldest entries based on access timestamp
 */
function cleanOldestEntries() {
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
}
