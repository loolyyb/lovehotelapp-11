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
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log("New message received:", payload);
          setMessages(current => [...current, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return { subscribeToNewMessages };
};