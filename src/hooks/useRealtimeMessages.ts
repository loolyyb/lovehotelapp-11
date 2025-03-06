
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeMessagesProps {
  onNewMessage?: (message: any) => void;
  onMessageUpdate?: (message: any) => void;
  currentProfileId?: string | null;
}

type MessageRow = {
  id: string;
  conversation_id: string;
  content: string;
  sender_id: string;
  created_at: string;
  [key: string]: any;
};

export const useRealtimeMessages = ({ 
  onNewMessage, 
  onMessageUpdate,
  currentProfileId 
}: UseRealtimeMessagesProps) => {
  const logger = useLogger("useRealtimeMessages");

  useEffect(() => {
    if (!currentProfileId) {
      logger.info("No current profile ID, skipping realtime subscription");
      return;
    }

    logger.info("Setting up realtime messages subscription", { currentProfileId });

    const channel = supabase
      .channel('messages-changes')
      .on<MessageRow>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        async (payload: RealtimePostgresChangesPayload<MessageRow>) => {
          // First check if payload.new exists and has required properties
          if (!payload.new || typeof payload.new !== 'object') {
            logger.warn("Received invalid payload", { payload });
            return;
          }
          
          // Type guard to ensure payload.new has an id property
          if (!('id' in payload.new) || typeof payload.new.id !== 'string') {
            logger.warn("Received payload without valid message id");
            return;
          }

          const messageId = payload.new.id;
          
          logger.info("Message change received", { 
            event: payload.eventType,
            messageId 
          });

          // Fetch complete message data with sender details
          const { data: message, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey (
                id,
                username,
                full_name,
                avatar_url
              )
            `)
            .eq('id', messageId)
            .maybeSingle();

          if (error) {
            logger.error("Error fetching message details", { error });
            return;
          }

          if (!message) {
            logger.warn("No message found after change", { messageId });
            return;
          }

          // Notify appropriate handler based on event type
          if (payload.eventType === 'INSERT') {
            logger.info("Calling onNewMessage handler with message", { messageId });
            onNewMessage?.(message);
          } else if (payload.eventType === 'UPDATE') {
            logger.info("Calling onMessageUpdate handler with message", { messageId });
            onMessageUpdate?.(message);
          }
        }
      )
      .subscribe((status) => {
        logger.info("Realtime subscription status", { status });
      });

    return () => {
      logger.info("Cleaning up realtime messages subscription");
      supabase.removeChannel(channel);
    };
  }, [currentProfileId, onNewMessage, onMessageUpdate, logger]);
};
