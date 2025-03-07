
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

    // Clean up existing subscription if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Clear the sets when changing profile ID
    lastProcessedMessageRef.current.clear();
    sentByMeRef.current.clear();

    const channelName = `messages-${currentProfileId}-${Date.now()}`;

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
          if (processingMessageRef.current) return;
          
          const messageId = payload.new?.id;
          if (!messageId || lastProcessedMessageRef.current.has(messageId)) {
            return;
          }

          if (sentByMeRef.current.has(messageId)) {
            logger.info("Ignoring message sent by this client", { messageId });
            return;
          }

          // Mark as processed immediately to prevent duplicate handling
          lastProcessedMessageRef.current.add(messageId);
          processingMessageRef.current = true;

          try {
            if (payload.new && payload.new.sender_id) {
              const { data: sender } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .eq('id', payload.new.sender_id)
                .single();
              
              const enrichedMessage = {
                ...payload.new,
                sender
              };
              
              onNewMessage(enrichedMessage);
            } else {
              onNewMessage(payload.new);
            }
          } catch (error: any) {
            logger.error("Error processing realtime message", {
              error: error.message,
              messageId
            });
            onNewMessage(payload.new);
          } finally {
            processingMessageRef.current = false;
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
      .subscribe();

    return () => {
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
