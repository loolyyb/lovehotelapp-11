
import { useEffect, useRef } from 'react';
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
  const channelRef = useRef<any>(null);
  const messageHandlersRef = useRef({ onNewMessage, onMessageUpdate });
  
  // Update refs when handlers change
  useEffect(() => {
    messageHandlersRef.current = { onNewMessage, onMessageUpdate };
  }, [onNewMessage, onMessageUpdate]);

  useEffect(() => {
    if (!currentProfileId) {
      logger.info("No current profile ID, skipping realtime subscription");
      return;
    }

    logger.info("Setting up realtime messages subscription", { currentProfileId });

    // Clean up previous subscription if it exists
    if (channelRef.current) {
      logger.info("Removing existing channel subscription");
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channelId = `messages-changes-${currentProfileId}-${Date.now()}`;
    logger.info(`Creating new channel: ${channelId}`);
    
    const channel = supabase
      .channel(channelId)
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
            logger.warn("Received payload without valid message id", { payload });
            return;
          }

          if (!('conversation_id' in payload.new)) {
            logger.warn("Received payload without conversation_id", { payload });
            return;
          }

          const messageId = payload.new.id;
          const conversationId = payload.new.conversation_id;
          
          logger.info("Message change received", { 
            event: payload.eventType,
            messageId,
            conversationId
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
            logger.error("Error fetching message details", { 
              error,
              messageId,
              conversationId
            });
            return;
          }

          if (!message) {
            logger.warn("No message found after change", { 
              messageId,
              conversationId 
            });
            return;
          }

          // Notify appropriate handler based on event type
          if (payload.eventType === 'INSERT') {
            logger.info("Calling onNewMessage handler with message", { 
              messageId,
              conversationId 
            });
            messageHandlersRef.current.onNewMessage?.(message);
          } else if (payload.eventType === 'UPDATE') {
            logger.info("Calling onMessageUpdate handler with message", { 
              messageId,
              conversationId 
            });
            messageHandlersRef.current.onMessageUpdate?.(message);
          }
        }
      )
      .subscribe((status) => {
        logger.info("Realtime subscription status", { status, channelId });
      });

    // Store channel reference for cleanup
    channelRef.current = channel;

    return () => {
      logger.info("Cleaning up realtime messages subscription", { channelId });
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentProfileId, logger]);
};
