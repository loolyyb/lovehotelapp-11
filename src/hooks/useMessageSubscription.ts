
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";

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
      logger.error("No conversation ID for subscription", {
        component: "useMessageSubscription"
      });
      return () => {};
    }
    
    logger.info("Setting up real-time subscription", { 
      conversationId,
      component: "useMessageSubscription" 
    });
    
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
          logger.info("Message change received", { 
            eventType: payload.eventType,
            payload: payload,
            component: "useMessageSubscription" 
          });
          
          if (payload.eventType === 'INSERT') {
            // Pour les nouveaux messages, on récupère le message complet avec les données du profil expéditeur
            fetchMessageWithSender(payload.new.id).then(fullMessage => {
              if (fullMessage) {
                logger.info("Adding new message with sender details", { 
                  messageId: fullMessage.id,
                  senderId: fullMessage.sender_id,
                  component: "useMessageSubscription" 
                });
                setMessages(current => [...current, fullMessage]);
              } else {
                logger.error("Failed to fetch full message details", { 
                  messageId: payload.new.id,
                  component: "useMessageSubscription" 
                });
              }
            });
          } else if (payload.eventType === 'UPDATE') {
            // Pour les messages mis à jour (comme lorsqu'ils sont marqués comme lus)
            logger.info("Message updated", { 
              messageId: payload.new.id,
              component: "useMessageSubscription" 
            });
            setMessages(current => 
              current.map(msg => 
                msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
              )
            );
          }
        }
      )
      .subscribe((status) => {
        logger.info("Channel subscription status", { 
          status,
          conversationId,
          component: "useMessageSubscription" 
        });
      });

    return () => {
      logger.info("Cleaning up message subscription", {
        conversationId,
        component: "useMessageSubscription"
      });
      supabase.removeChannel(channel);
    };
  };

  // Fonction pour récupérer un message avec les détails de l'expéditeur
  const fetchMessageWithSender = async (messageId: string) => {
    try {
      logger.info("Fetching message with sender details", { 
        messageId,
        component: "useMessageSubscription" 
      });
      
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
            full_name,
            avatar_url
          )
        `)
        .eq('id', messageId)
        .maybeSingle();

      if (error) {
        logger.error("Error fetching message with sender", { 
          error,
          messageId,
          component: "useMessageSubscription" 
        });
        return null;
      }

      logger.info("Successfully fetched message with sender", { 
        messageId,
        component: "useMessageSubscription" 
      });
      
      return data;
    } catch (error: any) {
      logger.error("Error in fetchMessageWithSender", { 
        error: error.message,
        stack: error.stack,
        messageId,
        component: "useMessageSubscription" 
      });
      return null;
    }
  };

  return { subscribeToNewMessages };
};
