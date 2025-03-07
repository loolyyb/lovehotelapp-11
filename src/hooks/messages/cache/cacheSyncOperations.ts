
import { logger } from "@/services/LogService";
import { MessageCacheStore } from "./messageCacheStore";
import { MAX_CACHE_AGE_MS, getCacheKey } from "./cacheSettings";

// Track in-progress sync operations to prevent duplicates
const syncOperations = new Map<string, boolean>();
const syncTimers = new Map<string, number>();

/**
 * Operations for syncing and checking for newer messages
 * with optimizations to prevent duplicate requests
 */
export const CacheSyncOperations = {
  /**
   * Check for newer messages since the last fetch with optimization
   * to prevent duplicate or unnecessary requests
   */
  async checkForNewerMessages(
    supabase: any,
    conversationId: string, 
    existingMessages: any[]
  ): Promise<any[] | null> {
    if (!conversationId || !existingMessages || existingMessages.length === 0) {
      return null;
    }
    
    // Skip if already syncing this conversation
    if (syncOperations.get(conversationId)) {
      logger.info("Sync already in progress for conversation", { conversationId });
      return null;
    }
    
    // Check if cache is still fresh enough to not need a sync
    const cacheKey = getCacheKey(conversationId);
    const cached = MessageCacheStore._cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < MAX_CACHE_AGE_MS / 2)) {
      logger.info("Cache is still fresh, skipping sync", { 
        conversationId,
        ageMs: Date.now() - cached.timestamp
      });
      return null;
    }
    
    // Mark sync as in progress
    syncOperations.set(conversationId, true);
    
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
      
      // Update timestamp even when no new messages found
      // to prevent too frequent checks
      if (cached) {
        cached.timestamp = Date.now();
        MessageCacheStore._cache.set(cacheKey, cached);
      }
      
      return null;
    } catch (error) {
      logger.error("Error in checkForNewerMessages", { error });
      return null;
    } finally {
      // Clear any existing timer
      if (syncTimers.has(conversationId)) {
        window.clearTimeout(syncTimers.get(conversationId));
      }
      
      // Remove from in-progress operations after a delay
      // to prevent immediate duplicates
      const timerId = window.setTimeout(() => {
        syncOperations.delete(conversationId);
        syncTimers.delete(conversationId);
      }, 800) as unknown as number;
      
      syncTimers.set(conversationId, timerId);
    }
  },
  
  // Clean up all sync operations and timers
  cleanupSync() {
    syncOperations.clear();
    
    // Clear all timers
    syncTimers.forEach(timerId => {
      window.clearTimeout(timerId);
    });
    syncTimers.clear();
  }
};
