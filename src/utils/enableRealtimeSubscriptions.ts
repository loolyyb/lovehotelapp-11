
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
    
    // Vérifier d'abord si l'utilisateur est authentifié
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      logger.error("No authenticated session, skipping realtime subscriptions");
      return null;
    }
    
    // Créer un canal unique pour éviter les doublons de souscriptions
    const channelId = `public-conversations-${Date.now()}`;
    logger.info(`Creating channel with ID: ${channelId}`);
    
    // Créer un canal pour les tables conversations et messages
    const channel = supabase.channel(channelId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user1_id=eq.${session.user.id}` 
      }, (payload) => {
        logger.info("Received conversation change - user1", { payload });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user2_id=eq.${session.user.id}`
      }, (payload) => {
        logger.info("Received conversation change - user2", { payload });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        logger.info("Received message change", { payload });
      })
      .subscribe((status) => {
        logger.info("Subscription status", { status, channelId });
        
        if (status === 'SUBSCRIBED') {
          logger.info("Successfully subscribed to realtime changes");
        } else if (status === 'CHANNEL_ERROR') {
          logger.error("Error subscribing to realtime changes");
        }
      });
      
    // Nous retournons le canal pour pouvoir se désinscrire si nécessaire
    return channel;
  } catch (error) {
    logger.error("Error setting up realtime subscriptions", { error });
    return null;
  }
};
