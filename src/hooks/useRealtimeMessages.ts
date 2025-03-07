
import { useEffect, useRef, useCallback } from "react";
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
  const lastProcessedMessageRef = useRef<Set<string>>(new Set());
  const processingMessageRef = useRef<boolean>(false);
  const sentByMeRef = useRef<Set<string>>(new Set());

  // Track messages that this client has sent
  const trackSentMessage = useCallback((messageId: string) => {
    sentByMeRef.current.add(messageId);
    // Remove from tracking after 10 seconds to prevent memory leaks
    setTimeout(() => {
      sentByMeRef.current.delete(messageId);
    }, 10000);
  }, []);

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

    // Clear the set when changing profile ID
    lastProcessedMessageRef.current.clear();
    sentByMeRef.current.clear();

    // Create a unique channel name with timestamp to avoid conflicts
    const channelName = `messages-${currentProfileId}-${Date.now()}`;

    // Subscribe to new messages with optimized filter
    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          if (processingMessageRef.current) return;
          
          const messageId = payload.new?.id;
          if (!messageId || lastProcessedMessageRef.current.has(messageId)) {
            return; // Skip if already processed or invalid
          }

          // Skip messages that were sent by this client to avoid duplicates
          if (sentByMeRef.current.has(messageId)) {
            logger.info("Ignoring message sent by this client", { 
              messageId: messageId
            });
            return;
          }

          logger.info("New message received via realtime", { 
            messageId: payload.new.id, 
            conversationId: payload.new.conversation_id,
            senderId: payload.new.sender_id,
            currentProfileId
          });

          // Mark as processed to prevent duplicate handling
          lastProcessedMessageRef.current.add(messageId);

          // Only process messages if they're relevant to current user
          // Either as sender or receiver in their conversation
          const conversationId = payload.new.conversation_id;
          if (conversationId && (conversationId.includes(currentProfileId) || 
              payload.new.sender_id === currentProfileId)) {
              
            processingMessageRef.current = true;
            
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
                    onNewMessage({...payload.new});
                    processingMessageRef.current = false;
                    return;
                  }
                  
                  const enrichedMessage = {
                    ...payload.new,
                    sender
                  };
                  
                  logger.info("Delivering enriched message to handler", {
                    messageId: payload.new.id, // Access id from payload.new instead of enrichedMessage
                    hasProfileInfo: !!enrichedMessage.sender
                  });
                  
                  onNewMessage(enrichedMessage);
                } catch (error: any) {
                  logger.error("Exception in fetching sender for realtime message", {
                    error: error.message,
                    stack: error.stack,
                    senderId: payload.new.sender_id
                  });
                  // Still deliver the message even if sender fetch fails
                  onNewMessage(payload.new);
                } finally {
                  processingMessageRef.current = false;
                }
              };
              
              // Execute the async function
              fetchSender();
            } else {
              onNewMessage(payload.new);
              processingMessageRef.current = false;
            }
          } else {
            processingMessageRef.current = false;
          }
          
          // Clean up old message ids from the set after 5 minutes to prevent memory leaks
          setTimeout(() => {
            lastProcessedMessageRef.current.delete(messageId);
          }, 300000);
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
        logger.info("Realtime subscription status", { status, channelName });
      });

    // Cleanup
    return () => {
      logger.info("Cleaning up realtime subscription");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentProfileId, onNewMessage, onMessageUpdate, logger]);

  return { 
    handleNewMessage: onNewMessage, 
    trackSentMessage 
  };
};
