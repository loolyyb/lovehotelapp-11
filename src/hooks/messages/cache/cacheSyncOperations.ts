
import { logger } from "@/services/LogService";
import { MessageCacheStore } from "./messageCacheStore";

/**
 * Operations for syncing and checking for newer messages
 */
export const CacheSyncOperations = {
  /**
   * Check for newer messages since the last fetch
   * @param supabase - Supabase client
   * @param conversationId - ID of the conversation
   * @param existingMessages - Currently cached messages
   * @returns Updated messages array or null if no new messages
   */
  async checkForNewerMessages(
    supabase: any,
    conversationId: string, 
    existingMessages: any[]
  ): Promise<any[] | null> {
    if (!conversationId || !existingMessages || existingMessages.length === 0) {
      return null;
    }
    
    try {
      // Get the timestamp of the newest message we have
      const newestMessage = [...existingMessages].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      
      // Optimized query to only fetch messages newer than what we already have
      // and only select fields we need
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
        logger.error("Error checking for newer messages", { 
          error, 
          conversationId 
        });
        return null;
      }
      
      if (newerMessages && newerMessages.length > 0) {
        logger.info(`Found ${newerMessages.length} new messages`, { 
          conversationId 
        });
        
        // Update cache and return new messages
        const updatedMessages = [...existingMessages, ...newerMessages];
        MessageCacheStore.set(conversationId, updatedMessages);
        return updatedMessages;
      }
      
      return null;
    } catch (error) {
      logger.error("Error in checkForNewerMessages", { error });
      return null;
    }
  }
};
