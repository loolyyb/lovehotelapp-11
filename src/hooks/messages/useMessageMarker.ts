
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";

interface UseMessageMarkerProps {
  conversationId: string;
  currentProfileId: string | null;
}

export const useMessageMarker = ({
  conversationId,
  currentProfileId
}: UseMessageMarkerProps) => {
  const markMessagesAsRead = async () => {
    if (!currentProfileId) {
      logger.info("No current profile ID, skipping mark as read", {
        component: "useMessageMarker"
      });
      return;
    }
    
    if (!conversationId) {
      logger.info("No conversation ID, skipping mark as read", {
        component: "useMessageMarker"
      });
      return;
    }

    try {
      logger.info("Marking messages as read", { 
        currentProfileId, 
        conversationId,
        component: "useMessageMarker" 
      });
      
      // First check if there are any unread messages
      const { data: unreadMessages, error: checkError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentProfileId)
        .is('read_at', null);

      if (checkError) {
        logger.error("Error checking unread messages", { 
          error: checkError,
          component: "useMessageMarker" 
        });
        throw checkError;
      }

      if (!unreadMessages || unreadMessages.length === 0) {
        logger.info("No unread messages to mark", {
          component: "useMessageMarker"
        });
        return;
      }

      logger.info("Found unread messages to mark as read", { 
        count: unreadMessages.length,
        messageIds: unreadMessages.map(msg => msg.id),
        component: "useMessageMarker" 
      });

      const { error: updateError } = await supabase
        .from('messages')
        .update({ 
          read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentProfileId)
        .is('read_at', null);

      if (updateError) {
        logger.error("Error marking messages as read", { 
          error: updateError,
          component: "useMessageMarker" 
        });
        throw updateError;
      }

      logger.info("Successfully marked messages as read", {
        component: "useMessageMarker"
      });
    } catch (error: any) {
      logger.error("Error in markMessagesAsRead", { 
        error: error.message, 
        stack: error.stack,
        component: "useMessageMarker" 
      });
      AlertService.captureException(error);
    }
  };

  return { markMessagesAsRead };
};
