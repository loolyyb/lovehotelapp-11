
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUnreadMessages(userId?: string) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadMessages = async () => {
    try {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'active');

      if (!conversations) return;

      const { data: messages, error } = await supabase
        .from('messages')
        .select('id')
        .in('conversation_id', conversations.map(c => c.id))
        .is('read_at', null)
        .neq('sender_id', userId);

      if (error) throw error;

      setUnreadCount(messages?.length || 0);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const checkIfUserIsRecipient = async (conversationId: string, message: any) => {
    try {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!conversation) return;

      if (
        (conversation.user1_id === userId ||
         conversation.user2_id === userId) &&
        message.sender_id !== userId
      ) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error checking message recipient:', error);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload: any) => {
          const conversation = payload.new.conversation_id;
          checkIfUserIsRecipient(conversation, payload.new);
        }
      )
      .subscribe();

    fetchUnreadMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { unreadCount };
}
