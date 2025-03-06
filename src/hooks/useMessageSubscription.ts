
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
            // Pour les nouveaux messages, on les ajoute à la liste
            setMessages(current => [...current, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            // Pour les messages mis à jour (comme lorsqu'ils sont marqués comme lus),
            // on met à jour la liste des messages
            setMessages(current => 
              current.map(msg => 
                msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
              )
            );
            
            // Ajouter un log pour voir les mises à jour
            console.log("Message updated:", payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log("Channel subscription status:", status);
      });

    return () => {
      console.log("Cleaning up message subscription");
      supabase.removeChannel(channel);
    };
  };

  return { subscribeToNewMessages };
};
