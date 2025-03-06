
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";

/**
 * Active les abonnements temps réel pour les tables de conversation
 * Cette fonction doit être appelée au démarrage de l'application
 */
export const enableRealtimeSubscriptions = async () => {
  const logger = useLogger("enableRealtimeSubscriptions");
  
  try {
    logger.info("Setting up channel for realtime subscriptions");
    
    // Create a channel for conversations table
    const channel = supabase.channel('public:conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, (payload) => {
        logger.info("Received conversation change", { payload });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        logger.info("Received message change", { payload });
      })
      .subscribe((status) => {
        logger.info("Subscription status", { status });
        
        if (status === 'SUBSCRIBED') {
          logger.info("Successfully subscribed to realtime changes");
        } else if (status === 'CHANNEL_ERROR') {
          logger.error("Error subscribing to realtime changes");
        }
      });
      
    // We'll return the channel so it can be unsubscribed if needed
    return channel;
  } catch (error) {
    logger.error("Error setting up realtime subscriptions", { error });
    return null;
  }
};
