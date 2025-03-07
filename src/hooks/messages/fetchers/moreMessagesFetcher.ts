
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";
import { MessageCache } from '../cache/messageCache';
import { MESSAGE_PAGINATION } from './constants';
import { buildMessageQuery, handleQueryError } from './messageQueryBuilder';

/**
 * Fetch more (older) messages for a conversation
 */
export const fetchMoreMessages = async (
  conversationId: string,
  currentProfileId: string | null,
  hasMoreMessages: boolean
): Promise<any[] | null> => {
  if (!conversationId || !currentProfileId || !hasMoreMessages) return null;
  
  try {
    // Get current messages to determine the offset
    const currentMessages = MessageCache.get(conversationId) || [];
    
    logger.info("Fetching more messages", { 
      conversationId, 
      currentCount: currentMessages.length,
      component: "moreMessagesFetcher" 
    });
    
    // Find the oldest message we have
    if (currentMessages.length === 0) {
      return null;
    }
    
    const oldestMessage = [...currentMessages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )[0];
    
    // Fetch older messages with optimized query
    const { data: olderMessages, error } = await buildMessageQuery()
      .eq('conversation_id', conversationId)
      .lt('created_at', oldestMessage.created_at)
      .order('created_at', { ascending: false })
      .limit(MESSAGE_PAGINATION.PAGINATION_SIZE)
      .order('created_at', { ascending: true });
    
    if (error) {
      return handleQueryError(error, "fetching more messages");
    }
    
    logger.info("Successfully fetched more messages", { 
      count: olderMessages?.length || 0, 
      conversationId,
      component: "moreMessagesFetcher" 
    });
    
    if (olderMessages && olderMessages.length > 0) {
      // Update the cache with new messages
      const updatedMessages = [...olderMessages, ...currentMessages];
      MessageCache.set(conversationId, updatedMessages);
      return updatedMessages;
    }
    
    return null;
  } catch (error: any) {
    logger.error("Network error fetching more messages", {
      error: error.message,
      stack: error.stack,
      component: "moreMessagesFetcher"
    });
    AlertService.captureException(error);
    return null;
  }
};
