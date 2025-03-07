
import { MessageCache } from './index';
import { logger } from "@/services/LogService";

/**
 * Utility functions for message cache operations
 * IMPORTANT: This file is maintained for compatibility with existing code
 * New code should import from './index' directly
 */
export const MessageCacheOperations = {
  /**
   * Add a single message to the cache
   * @returns boolean indicating whether the operation was successful
   */
  addMessageToCache: (conversationId: string, message: any): boolean => {
    if (!conversationId) return false;
    
    if (MessageCache.has(conversationId)) {
      // Add to cache
      return MessageCache.addMessage(conversationId, message);
    }
    return false;
  },

  /**
   * Check for newer messages since the last fetch
   */
  checkForNewerMessages: async (
    supabase: any,
    conversationId: string, 
    existingMessages: any[]
  ): Promise<any[] | null> => {
    return MessageCache.checkForNewerMessages(supabase, conversationId, existingMessages);
  },

  /**
   * Clear the cache when needed (e.g., on logout)
   */
  clearCache: (): void => {
    MessageCache.clearAll();
  },
  
  /**
   * Clear cache for a specific conversation
   */
  clearConversationCache: (conversationId: string): void => {
    MessageCache.clearConversation(conversationId);
  }
};
