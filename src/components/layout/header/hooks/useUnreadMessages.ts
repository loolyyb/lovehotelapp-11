import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No active session found');
          return;
        }

        const { data: messages, error } = await supabase
          .from('messages')
          .select('id')
          .eq('read_at', null)
          .neq('sender_id', session.user.id);

        if (error) {
          console.error('Error fetching unread messages:', error);
          return;
        }

        setUnreadCount(messages?.length || 0);
      } catch (error) {
        console.error('Error in useUnreadMessages:', error);
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages' 
        }, 
        fetchUnreadCount
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return unreadCount;
};