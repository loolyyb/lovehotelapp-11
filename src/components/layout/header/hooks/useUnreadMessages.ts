import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUnreadMessages(userProfile: any) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userProfile?.user_id) return;

    const fetchUnreadMessages = async () => {
      try {
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')
          .or(`user1_id.eq.${userProfile?.user_id},user2_id.eq.${userProfile?.user_id}`)
          .eq('status', 'active');

        if (!conversations) return;

        const { data: messages, error } = await supabase
          .from('messages')
          .select('id')
          .in('conversation_id', conversations.map(c => c.id))
          .is('read_at', null)
          .neq('sender_id', userProfile?.user_id);

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
          (conversation.user1_id === userProfile?.user_id || 
           conversation.user2_id === userProfile?.user_id) && 
          message.sender_id !== userProfile?.user_id
        ) {
          setUnreadCount(prev => prev + 1);
        }
      } catch (error) {
        console.error('Error checking message recipient:', error);
      }
    };

    // Subscribe to new messages
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
  }, [userProfile]);

  return unreadCount;
}