
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";
import { MessageCache } from '../cache/messageCache';
import { MessageCacheOperations } from '../cache/messageCacheOperations';
import { MESSAGE_PAGINATION } from './constants';
import { buildMessageQuery, handleQueryError } from './messageQueryBuilder';

/**
 * Fetch initial messages for a conversation
 */
export const fetchInitialMessages = async (
  conversationId: string,
  currentProfileId: string | null,
  useCache = true
): Promise<any[] | null> => {
  if (!conversationId || !currentProfileId) {
    logger.info("Cannot fetch messages: missing ID", { 
      hasConversationId: !!conversationId, 
      hasProfileId: !!currentProfileId,
      component: "initialMessagesFetcher" 
    });
    return null;
  }

  try {
    // Try to get from cache first if allowed
    if (useCache && MessageCache.has(conversationId)) {
      logger.info("Using cached messages", {
        conversationId,
        cachedCount: MessageCache.get(conversationId)?.length || 0,
        component: "initialMessagesFetcher"
      });
      
      const cachedMessages = MessageCache.get(conversationId);
      if (cachedMessages && cachedMessages.length > 0) {
        // Check for newer messages in the background after a short delay
        setTimeout(() => {
          MessageCacheOperations.checkForNewerMessages(supabase, conversationId, cachedMessages);
        }, 2000);
        
        return cachedMessages;
      }
    }

    logger.info("Fetching messages from database", { 
      conversationId, 
      currentProfileId,
      component: "initialMessagesFetcher" 
    });
    
    // Build and execute the query
    const { data: messagesData, error } = await buildMessageQuery()
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(MESSAGE_PAGINATION.INITIAL_PAGE_SIZE)
      .order('created_at', { ascending: true });
    
    if (error) {
      return handleQueryError(error, "fetching messages");
    }
    
    logger.info("Successfully fetched messages", { 
      count: messagesData?.length || 0, 
      conversationId,
      component: "initialMessagesFetcher" 
    });
    
    // Cache the results
    if (messagesData) {
      MessageCache.set(conversationId, messagesData);
    }
    
    return messagesData || [];
  } catch (error: any) {
    logger.error("Network error fetching messages", {
      error: error.message,
      stack: error.stack,
      component: "initialMessagesFetcher"
    });
    AlertService.captureException(error);
    return null;
  }
};
