
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";

export const useConversationsRealtime = (
  currentProfileId: string | null,
  onConversationChange: () => void,
  onNewMessage: (message: any) => void
) => {
  const channelRef = useRef<any>(null);
  const logger = useLogger("useConversationsRealtime");

  // Setup channel subscription
  useEffect(() => {
    if (!currentProfileId) {
      logger.info("No profile ID available for realtime subscription");
      return;
    }
    
    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channelId = `conversations-updates-${currentProfileId}-${Date.now()}`;
    logger.info(`Setting up conversation realtime subscription: ${channelId}`);
    
    try {
      const channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          {
            event: '*',  // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'conversations',
            filter: `user1_id=eq.${currentProfileId}`, 
          },
          (payload) => {
            // Ensure payload.new is defined and has an id
            if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
              logger.info("Conversation change detected", { 
                event: payload.eventType,
                conversationId: payload.new.id,
                timestamp: new Date().toISOString()
              });
              onConversationChange();
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',  // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'conversations',
            filter: `user2_id=eq.${currentProfileId}`, 
          },
          (payload) => {
            // Ensure payload.new is defined and has an id
            if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
              logger.info("Conversation change detected", { 
                event: payload.eventType,
                conversationId: payload.new.id,
                timestamp: new Date().toISOString()
              });
              onConversationChange();
            }
          }
        )
        .subscribe((status) => {
          logger.info("Conversation subscription status", { status, channelId });
        });
        
      channelRef.current = channel;
    } catch (error) {
      logger.error("Error setting up conversation realtime subscription", { error, channelId });
    }
    
    return () => {
      logger.info(`Removing conversation subscription: ${channelId}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentProfileId, logger, onConversationChange]);

  // Handle new messages callback
  const handleNewMessage = useCallback((message: any) => {
    logger.info("New message received in realtime hook", { 
      messageId: message.id, 
      conversationId: message.conversation_id,
      timestamp: new Date().toISOString()
    });
    
    onNewMessage(message);
  }, [logger, onNewMessage]);

  return { handleNewMessage };
};
