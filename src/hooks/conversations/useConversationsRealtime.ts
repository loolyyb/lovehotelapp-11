
import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";

export const useConversationsRealtime = (
  currentProfileId: string | null,
  onConversationChange: () => void,
  onNewMessage: (message: any) => void
) => {
  const channelRef = useRef<any>(null);
  const messagesChannelRef = useRef<any>(null);
  const logger = useLogger("useConversationsRealtime");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Setup channel subscription
  useEffect(() => {
    if (!currentProfileId) {
      logger.info("No profile ID available for realtime subscription");
      return;
    }
    
    // Clean up any existing channels
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    if (messagesChannelRef.current) {
      supabase.removeChannel(messagesChannelRef.current);
    }

    // Fetch initial unread counts
    fetchUnreadCounts(currentProfileId);

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
      
      // Set up messages channel to track unread counts
      const messagesChannelId = `messages-updates-${currentProfileId}-${Date.now()}`;
      
      messagesChannelRef.current = supabase
        .channel(messagesChannelId)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          async (payload) => {
            if (payload.new && payload.new.conversation_id && payload.new.sender_id !== currentProfileId) {
              logger.info("New message detected for unread count", { 
                conversationId: payload.new.conversation_id 
              });
              
              // Check if this message is for a conversation the user is part of
              const { data: conversation } = await supabase
                .from('conversations')
                .select('*')
                .eq('id', payload.new.conversation_id)
                .or(`user1_id.eq.${currentProfileId},user2_id.eq.${currentProfileId}`)
                .single();
                
              if (conversation) {
                // Update unread count for this conversation
                setUnreadCounts(prev => ({
                  ...prev,
                  [payload.new.conversation_id]: (prev[payload.new.conversation_id] || 0) + 1
                }));
                
                // Also trigger conversation change to refresh the list
                onConversationChange();
              }
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
            // If a message is marked as read, update counts
            if (payload.new && payload.new.read_at && !payload.old.read_at) {
              // Reset unread count for this conversation
              fetchUnreadCounts(currentProfileId);
            }
          }
        )
        .subscribe((status) => {
          logger.info("Messages subscription status", { status, messagesChannelId });
        });
        
    } catch (error) {
      logger.error("Error setting up conversation realtime subscription", { error, channelId });
    }
    
    return () => {
      logger.info(`Removing conversation subscription: ${channelId}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
    };
  }, [currentProfileId, logger, onConversationChange]);

  // Fetch unread message counts for all conversations
  const fetchUnreadCounts = async (profileId: string) => {
    try {
      // First get all conversations the user is part of
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${profileId},user2_id.eq.${profileId}`);
        
      if (!conversations || conversations.length === 0) {
        return;
      }
      
      // Now get unread counts for each conversation
      const conversationIds = conversations.map(c => c.id);
      
      // For each conversation, count unread messages
      const results = await Promise.all(
        conversationIds.map(async (conversationId) => {
          const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: false })
            .eq('conversation_id', conversationId)
            .is('read_at', null)
            .neq('sender_id', profileId);
            
          if (error) {
            logger.error("Error fetching unread count", { error, conversationId });
            return { conversationId, count: 0 };
          }
          
          return { conversationId, count: count || 0 };
        })
      );
      
      // Update state with the results
      const newCounts = results.reduce((acc, { conversationId, count }) => {
        if (count > 0) {
          acc[conversationId] = count;
        }
        return acc;
      }, {} as Record<string, number>);
      
      setUnreadCounts(newCounts);
      
    } catch (error) {
      logger.error("Error in fetchUnreadCounts", { error });
    }
  };

  // Handle new messages callback
  const handleNewMessage = useCallback((message: any) => {
    logger.info("New message received in realtime hook", { 
      messageId: message.id, 
      conversationId: message.conversation_id,
      timestamp: new Date().toISOString()
    });
    
    onNewMessage(message);
  }, [logger, onNewMessage]);

  return { 
    handleNewMessage,
    unreadCounts,
    refreshUnreadCounts: () => fetchUnreadCounts(currentProfileId || '')
  };
};
