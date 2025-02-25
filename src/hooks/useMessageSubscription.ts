
import { supabase } from "@/integrations/supabase/client";

interface UseMessageSubscriptionProps {
  conversationId: string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

export const useMessageSubscription = ({ 
  conversationId, 
  setMessages 
}: UseMessageSubscriptionProps) => {
  const subscribeToNewMessages = () => {
    console.log("Setting up real-time subscription for conversation:", conversationId);
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log("Message change received:", payload);
          if (payload.eventType === 'INSERT') {
            setMessages(current => [...current, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages(current => 
              current.map(msg => 
                msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return { subscribeToNewMessages };
};
