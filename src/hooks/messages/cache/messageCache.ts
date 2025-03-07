
/**
 * Shared cache utility for messages to reduce database queries
 */

// Cache for messages to reduce database queries
const messagesCache = new Map<string, any[]>();

/**
 * Message cache utilities to manage cached messages
 */
export const MessageCache = {
  /**
   * Get messages from cache
   */
  get: (conversationId: string): any[] | undefined => {
    const cacheKey = `${conversationId}_messages`;
    return messagesCache.get(cacheKey);
  },

  /**
   * Store messages in cache
   */
  set: (conversationId: string, messages: any[]): void => {
    const cacheKey = `${conversationId}_messages`;
    messagesCache.set(cacheKey, messages);
  },

  /**
   * Add a single message to the cache
   */
  addMessage: (conversationId: string, message: any): void => {
    const cacheKey = `${conversationId}_messages`;
    const currentMessages = messagesCache.get(cacheKey) || [];
    
    // Check if message already exists to prevent duplicates
    if (!currentMessages.some(msg => msg.id === message.id)) {
      messagesCache.set(cacheKey, [...currentMessages, message]);
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
    return messagesCache.has(cacheKey);
  }
};
