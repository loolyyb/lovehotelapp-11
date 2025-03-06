
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";

interface UseInitialMessagesProps {
  conversationId: string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

export const useInitialMessages = ({
  conversationId,
  setMessages
}: UseInitialMessagesProps) => {
  const fetchInitialMessages = async () => {
    if (!conversationId) {
      logger.info("No conversation ID provided for initial messages", {
        component: "useInitialMessages"
      });
      setMessages([]);
      return null;
    }

    try {
      logger.info("Fetching initial messages", { 
        conversationId,
        component: "useInitialMessages" 
      });
      
      const { data: initialMessages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read_at,
          sender_id,
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
        .order('created_at', { ascending: true });

      if (messagesError) {
        logger.error("Error fetching initial messages", { 
          error: messagesError,
          conversationId,
          component: "useInitialMessages" 
        });
        setMessages([]);
        throw messagesError;
      }
      
      if (initialMessages && initialMessages.length > 0) {
        logger.info("Loaded initial messages", { 
          count: initialMessages.length,
          conversationId,
          component: "useInitialMessages" 
        });
        setMessages(initialMessages);
        return initialMessages;
      } else {
        logger.info("No initial messages found", {
          conversationId,
          component: "useInitialMessages"
        });
        // Always set empty array to clear any previous messages
        setMessages([]);
        return [];
      }
    } catch (error: any) {
      logger.error("Error in fetchInitialMessages", { 
        error: error.message,
        stack: error.stack,
        conversationId,
        component: "useInitialMessages" 
      });
      // Always set empty array on error
      setMessages([]);
      AlertService.captureException(error, {
        conversationId,
        component: "useInitialMessages"
      });
      return null;
    }
  };

  return { fetchInitialMessages };
};
