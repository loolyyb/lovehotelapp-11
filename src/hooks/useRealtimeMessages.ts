
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/LogService';

interface UseRealtimeMessagesProps {
  currentProfileId: string | null;
  onNewMessage?: (message: any) => void;
  onMessageUpdate?: (message: any) => void;
}

export const useRealtimeMessages = ({
  currentProfileId,
  onNewMessage,
  onMessageUpdate
}: UseRealtimeMessagesProps) => {
  const channelRef = useRef<any>(null);
  const logComponent = 'useRealtimeMessages';

  useEffect(() => {
    // Don't subscribe if no profile ID is available
    if (!currentProfileId) {
      logger.info("No current profile ID, skipping realtime subscription", { component: logComponent });
      return;
    }

    // Create a unique identifier for the channel
    const channelId = `messages-updates-${currentProfileId}-${Date.now()}`;
    logger.info(`Setting up message realtime subscription: ${channelId}`, { component: logComponent });

    try {
      // Subscribe to changes in the messages table
      const channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            if (payload.new) {
              // Check if the message is part of a conversation the user is in
              const conversationId = payload.new.conversation_id;
              
              logger.info("New message received via realtime", { 
                component: logComponent,
                messageId: payload.new.id,
                conversation: conversationId
              });
              
              // Check if this message is part of a conversation where the user is present
              supabase
                .from('conversations')
                .select('id')
                .eq('id', conversationId)
                .or(`user1_id.eq.${currentProfileId},user2_id.eq.${currentProfileId}`)
                .maybeSingle()
                .then(({ data, error }) => {
                  if (error) {
                    logger.error("Error checking conversation membership for realtime message", {
                      error,
                      conversationId,
                      component: logComponent
                    });
                    return;
                  }
                  
                  if (data && onNewMessage) {
                    logger.info("User is part of conversation, triggering new message callback", {
                      messageId: payload.new.id,
                      conversationId,
                      component: logComponent
                    });
                    onNewMessage(payload.new);
                  } else {
                    logger.info("User is not part of this conversation, ignoring message", {
                      conversationId,
                      component: logComponent
                    });
                  }
                });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            if (payload.new) {
              logger.info("Message update received via realtime", { 
                component: logComponent,
                messageId: payload.new.id,
                conversation: payload.new.conversation_id 
              });
              
              // Check if this message is part of a conversation where the user is present
              supabase
                .from('conversations')
                .select('id')
                .eq('id', payload.new.conversation_id)
                .or(`user1_id.eq.${currentProfileId},user2_id.eq.${currentProfileId}`)
                .maybeSingle()
                .then(({ data, error }) => {
                  if (error) {
                    logger.error("Error checking conversation membership for updated message", {
                      error,
                      conversationId: payload.new.conversation_id,
                      component: logComponent
                    });
                    return;
                  }
                  
                  if (data && onMessageUpdate) {
                    logger.info("User is part of conversation, triggering message update callback", {
                      messageId: payload.new.id,
                      conversationId: payload.new.conversation_id,
                      component: logComponent
                    });
                    onMessageUpdate(payload.new);
                  }
                });
            }
          }
        )
        .subscribe((status) => {
          logger.info("Message subscription status", { component: logComponent, status, channelId });
        });

      // Save the channel reference for later unsubscribe
      channelRef.current = channel;
    } catch (error) {
      logger.error("Error setting up realtime subscription", { 
        error, 
        component: logComponent 
      });
    }

    // Clean up the subscription when component unmounts
    return () => {
      logger.info(`Removing message subscription: ${channelId}`, { component: logComponent });
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentProfileId, onNewMessage, onMessageUpdate]);

  // This hook doesn't return anything since it only manages subscriptions
  return null;
};
