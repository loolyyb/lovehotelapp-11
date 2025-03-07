
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";

interface UseRealtimeMessagesProps {
  currentProfileId: string | null;
  onNewMessage: (message: any) => void;
  onMessageUpdate?: (message: any) => void;
}

export const useRealtimeMessages = ({
  currentProfileId,
  onNewMessage,
  onMessageUpdate
}: UseRealtimeMessagesProps) => {
  const logger = useLogger("useRealtimeMessages");
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!currentProfileId) {
      logger.info("No profile ID, skipping realtime subscription");
      return;
    }

    logger.info("Setting up realtime subscription for messages", {
      profileId: currentProfileId
    });

    // Clean up existing subscription if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Subscribe to new messages with optimized filter
    channelRef.current = supabase
      .channel(`messages-${currentProfileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${currentProfileId}` // Only listen for messages from others
        },
        (payload) => {
          logger.info("New message received via realtime", {
            messageId: payload.new.id,
            conversationId: payload.new.conversation_id
          });

          // Fetch sender details if needed
          if (payload.new && payload.new.sender_id) {
            // Use async function with try/catch for better error handling
            const fetchSender = async () => {
              try {
                const { data: sender, error } = await supabase
                  .from('profiles')
                  .select('id, username, full_name, avatar_url')
                  .eq('id', payload.new.sender_id)
                  .single();
                
                if (error) {
                  logger.error("Error fetching sender for realtime message", {
                    error,
                    senderId: payload.new.sender_id
                  });
                  // Still deliver the message even if sender fetch fails
                  onNewMessage(payload.new);
                  return;
                }
                
                onNewMessage({
                  ...payload.new,
                  sender
                });
              } catch (error: any) {
                logger.error("Exception in fetching sender for realtime message", {
                  error: error.message,
                  stack: error.stack,
                  senderId: payload.new.sender_id
                });
                // Still deliver the message even if sender fetch fails
                onNewMessage(payload.new);
              }
            };
            
            // Execute the async function
            fetchSender();
          } else {
            onNewMessage(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          if (onMessageUpdate && payload.new) {
            logger.info("Message updated via realtime", {
              messageId: payload.new.id
            });
            onMessageUpdate(payload.new);
          }
        }
      )
      .subscribe((status) => {
        logger.info("Realtime subscription status", { status });
      });

    // Cleanup
    return () => {
      logger.info("Cleaning up realtime subscription");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentProfileId, onNewMessage, onMessageUpdate, logger]);
};
