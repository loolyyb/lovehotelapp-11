
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { AlertService } from "@/services/AlertService";

export const useLatestMessagesFetcher = () => {
  const logger = useLogger("useLatestMessagesFetcher");

  const fetchLatestMessages = useCallback(async (conversations: any[]) => {
    if (!conversations || conversations.length === 0) {
      return [];
    }
    
    logger.info("Fetching latest messages for conversations", {
      count: conversations.length,
      conversationIds: conversations.map(c => c.id)
    });
    
    // For each conversation, get the most recent message with retries
    const getMessagesForConversation = async (conversationId: string, attempts = 0, maxRetries = 5) => {
      try {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender_id,
            read_at
          `)
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (messagesError) {
          throw messagesError;
        }
        
        return messages || [];
      } catch (error: any) {
        logger.error(`Error fetching messages for conversation (attempt ${attempts + 1})`, {
          error: error.message,
          conversationId,
          component: "useLatestMessagesFetcher"
        });
        
        if (attempts < maxRetries) {
          logger.info(`Retrying messages fetch (${attempts + 1}/${maxRetries})`, { 
            conversationId,
            component: "useLatestMessagesFetcher"
          });
          
          // Wait with exponential backoff before retrying
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempts), 10000)));
          return getMessagesForConversation(conversationId, attempts + 1);
        }
        
        // Return empty array on final failure
        return [];
      }
    };
    
    try {
      const conversationsWithMessages = await Promise.all(
        conversations.map(async (conversation) => {
          try {
            const messages = await getMessagesForConversation(conversation.id);
            
            logger.info("Messages for conversation", {
              conversationId: conversation.id,
              count: messages?.length || 0,
              component: "useLatestMessagesFetcher"
            });
            
            return {
              ...conversation,
              messages: messages
            };
          } catch (error: any) {
            logger.error("Error processing messages for conversation", {
              error: error.message,
              conversationId: conversation.id,
              component: "useLatestMessagesFetcher"
            });
            
            // Continue with empty messages array
            return { ...conversation, messages: [] };
          }
        })
      );
      
      const conversationsWithMessagesCount = conversationsWithMessages.filter(c => c.messages?.length > 0).length;
      
      logger.info("Fetched conversations with messages", { 
        count: conversationsWithMessages.length,
        hasMessages: conversationsWithMessagesCount,
        timestamp: new Date().toISOString(),
        component: "useLatestMessagesFetcher"
      });
      
      return conversationsWithMessages;
    } catch (error: any) {
      logger.error("Error fetching latest messages", {
        error: error.message,
        stack: error.stack,
        component: "useLatestMessagesFetcher"
      });
      AlertService.captureException(error);
      return conversations.map(conv => ({ ...conv, messages: [] }));
    }
  }, [logger]);

  return { fetchLatestMessages };
};
