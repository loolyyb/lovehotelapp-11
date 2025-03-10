
import { useRef, useEffect, useCallback } from "react";
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
  const subscriptionConnectedRef = useRef<boolean>(false);
  const subscriptionIdRef = useRef<string>("");
  const messageProcessingLockRef = useRef<Map<string, boolean>>(new Map());
  const connectionRetryCountRef = useRef<number>(0);
  const MAX_RETRY_COUNT = 5;

  // Track messages that this client has sent
  const trackSentMessage = useCallback((messageId: string) => {
    sentByMeRef.current.add(messageId);
    // Remove from tracking after 10 seconds to prevent memory leaks
    setTimeout(() => {
      sentByMeRef.current.delete(messageId);
    }, 10000);
  }, []);

  // Handle subscription connection with automatic retries
  const setupSubscription = useCallback(() => {
    if (!currentProfileId) {
      logger.info("No profile ID, skipping realtime subscription");
      return () => {};
    }

    // Clean up existing subscription if it exists
    if (channelRef.current) {
      logger.info("Removing existing realtime subscription", { 
        channelId: subscriptionIdRef.current 
      });
      supabase.removeChannel(channelRef.current);
      subscriptionConnectedRef.current = false;
    }

    // Clear the sets when changing profile ID
    lastProcessedMessageRef.current.clear();
    sentByMeRef.current.clear();
    messageProcessingLockRef.current.clear();

    const channelName = `messages-${currentProfileId}-${Date.now()}`;
    subscriptionIdRef.current = channelName;
    logger.info("Setting up new realtime subscription", { channelName });

    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          // Get message ID first to use in all logs
          const messageId = payload.new?.id;
          if (!messageId) {
            logger.info("No message ID in payload, skipping");
            return;
          }
          
          // Add strong lock using messageId to ensure we never process same message twice
          if (messageProcessingLockRef.current.get(messageId)) {
            logger.info("Message is currently being processed, skipping", { messageId });
            return;
          }
          
          // Skip processing if already handling a message
          if (processingMessageRef.current) {
            logger.info("Already processing a message, skipping", { messageId });
            return;
          }
          
          // Avoid processing messages we've already seen
          if (lastProcessedMessageRef.current.has(messageId)) {
            logger.info("Message already processed, skipping", { messageId });
            return;
          }

          // Skip messages sent by this client
          if (sentByMeRef.current.has(messageId)) {
            logger.info("Ignoring message sent by this client", { messageId });
            return;
          }

          // Set locks immediately to prevent duplicate handling
          lastProcessedMessageRef.current.add(messageId);
          processingMessageRef.current = true;
          messageProcessingLockRef.current.set(messageId, true);

          try {
            if (payload.new && payload.new.sender_id) {
              // Filter to only process messages for conversations this user is part of
              if (payload.new.conversation_id) {
                const { data: conversation } = await supabase
                  .from('conversations')
                  .select('user1_id, user2_id')
                  .eq('id', payload.new.conversation_id)
                  .single();
                  
                if (!conversation || 
                    (conversation.user1_id !== currentProfileId && 
                     conversation.user2_id !== currentProfileId)) {
                  logger.info("Message not for current user's conversation, ignoring", { messageId });
                  return;
                }
              }
              
              // Fetch sender profile data only if not already included
              if (!payload.new.sender) {
                const { data: sender } = await supabase
                  .from('profiles')
                  .select('id, username, full_name, avatar_url')
                  .eq('id', payload.new.sender_id)
                  .single();
                
                if (sender) {
                  const enrichedMessage = {
                    ...payload.new,
                    sender
                  };
                  
                  logger.info("New message enriched with sender data", { 
                    messageId: messageId,
                    senderId: sender.id
                  });
                  
                  onNewMessage(enrichedMessage);
                } else {
                  // Fallback if sender not found
                  logger.warn("Sender profile not found, using raw message", { messageId });
                  onNewMessage(payload.new);
                }
              } else {
                // Sender already included in payload
                logger.info("Using message with included sender", { messageId });
                onNewMessage(payload.new);
              }
            } else {
              // No sender_id in payload
              logger.info("Message without sender_id, using raw message");
              onNewMessage(payload.new);
            }
          } catch (error: any) {
            logger.error("Error processing realtime message", {
              error: error.message,
              messageId
            });
            // Still try to deliver the message even if enrichment fails
            onNewMessage(payload.new);
          } finally {
            // Only unlock processing after a slight delay to prevent rapid reprocessing
            setTimeout(() => {
              processingMessageRef.current = false;
              messageProcessingLockRef.current.delete(messageId);
            }, 100);
          }

          // Clean up old message ids after 5 minutes
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
            onMessageUpdate(payload.new);
          }
        }
      )
      .subscribe((status) => {
        const wasConnected = subscriptionConnectedRef.current;
        subscriptionConnectedRef.current = status === 'SUBSCRIBED';
        
        logger.info("Realtime subscription status changed", { 
          channelName, 
          status, 
          connected: subscriptionConnectedRef.current,
          previouslyConnected: wasConnected
        });
        
        // Handle reconnection attempts with backoff
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          if (connectionRetryCountRef.current < MAX_RETRY_COUNT) {
            const backoff = Math.pow(2, connectionRetryCountRef.current) * 1000;
            connectionRetryCountRef.current++;
            
            logger.info(`Subscription error, retrying in ${backoff}ms`, {
              attempt: connectionRetryCountRef.current,
              maxAttempts: MAX_RETRY_COUNT
            });
            
            setTimeout(() => {
              if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
              }
              setupSubscription();
            }, backoff);
          } else {
            logger.error("Max realtime reconnection attempts reached", {
              maxAttempts: MAX_RETRY_COUNT
            });
          }
        }
        
        // Reset retry count on successful connection
        if (status === 'SUBSCRIBED') {
          connectionRetryCountRef.current = 0;
        }
      });

    // Return cleanup function
    return () => {
      logger.info("Cleaning up realtime subscription", { channelName });
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        subscriptionConnectedRef.current = false;
      }
    };
  }, [currentProfileId, onNewMessage, onMessageUpdate, logger]);

  useEffect(() => {
    // Setup subscription and get cleanup function
    const cleanup = setupSubscription();
    
    // Use the cleanup function when component unmounts or dependencies change
    return cleanup;
  }, [setupSubscription]);

  return { 
    handleNewMessage: onNewMessage, 
    trackSentMessage,
    isSubscriptionConnected: subscriptionConnectedRef.current
  };
};
