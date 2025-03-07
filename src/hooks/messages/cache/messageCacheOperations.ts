
import { MessageCache } from './messageCache';
import { logger } from "@/services/LogService";

/**
 * Utility functions for message cache operations
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
      MessageCache.addMessage(conversationId, message);
      return true;
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
    if (!conversationId || existingMessages.length === 0) return null;
    
    try {
      // Get the timestamp of the newest message we have
      const newestMessage = [...existingMessages].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      
      // Only fetch messages newer than what we already have
      const { data: newerMessages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read_at,
          sender_id,
          conversation_id,
          media_type,
          media_url,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .gt('created_at', newestMessage.created_at)
        .order('created_at', { ascending: true });
      
      if (error) {
        logger.error("Error checking for newer messages", { error });
        return null;
      }
      
      if (newerMessages && newerMessages.length > 0) {
        logger.info(`Found ${newerMessages.length} new messages`, { conversationId });
        // Update cache and return new messages
        const updatedMessages = [...existingMessages, ...newerMessages];
        MessageCache.set(conversationId, updatedMessages);
        return updatedMessages;
      }
      
      return null;
    } catch (error) {
      logger.error("Error in checkForNewerMessages", { error });
      return null;
    }
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
