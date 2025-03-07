
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";

interface UseMessageMarkerProps {
  conversationId: string;
  currentProfileId: string | null;
}

/**
 * Hook for marking messages as read
 */
export const useMessageMarker = ({
  conversationId,
  currentProfileId
}: UseMessageMarkerProps) => {
  // Mark all unread messages in conversation as read
  const markMessagesAsRead = useCallback(async () => {
    if (!conversationId || !currentProfileId) return;

    try {
      logger.info("Marking messages as read", {
        conversationId,
        currentProfileId,
        component: "useMessageMarker"
      });
      
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('read_at', null)
        .neq('sender_id', currentProfileId);

      if (error) {
        logger.error("Error marking messages as read", {
          error,
          conversationId,
          component: "useMessageMarker"
        });
      } else {
        logger.info("Successfully marked messages as read", {
          conversationId,
          component: "useMessageMarker"
        });
      }
    } catch (error: any) {
      logger.error("Exception marking messages as read", {
        error: error.message,
        stack: error.stack,
        conversationId,
        component: "useMessageMarker"
      });
    }
  }, [conversationId, currentProfileId]);

  return { markMessagesAsRead };
};
