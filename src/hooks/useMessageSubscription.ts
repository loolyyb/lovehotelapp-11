
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
    if (!conversationId) {
      console.error("No conversation ID for subscription");
      return () => {};
    }
    
    console.log("Setting up real-time subscription for conversation:", conversationId);
    const channel = supabase
      .channel(`messages-changes-${conversationId}`)
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
            // Pour les nouveaux messages, on récupère le message complet avec les données du profil expéditeur
            fetchMessageWithSender(payload.new.id).then(fullMessage => {
              if (fullMessage) {
                console.log("Adding new message with sender details:", fullMessage);
                setMessages(current => [...current, fullMessage]);
              }
            });
          } else if (payload.eventType === 'UPDATE') {
            // Pour les messages mis à jour (comme lorsqu'ils sont marqués comme lus)
            console.log("Message updated:", payload.new);
            setMessages(current => 
              current.map(msg => 
                msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
              )
            );
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

  // Fonction pour récupérer un message avec les détails de l'expéditeur
  const fetchMessageWithSender = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read_at,
          sender_id,
          media_type,
          media_url,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            full_name
          )
        `)
        .eq('id', messageId)
        .single();

      if (error) {
        console.error("Error fetching message with sender:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in fetchMessageWithSender:", error);
      return null;
    }
  };

  return { subscribeToNewMessages };
};
