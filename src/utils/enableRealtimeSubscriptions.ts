
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";

/**
 * Active les abonnements temps réel pour les tables de conversation
 * Cette fonction doit être appelée au démarrage de l'application
 */
export const enableRealtimeSubscriptions = async () => {
  const logComponent = "enableRealtimeSubscriptions";
  
  try {
    logger.info("Setting up channel for realtime subscriptions", { component: logComponent });
    
    // Vérifier d'abord si l'utilisateur est authentifié
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      logger.error("No authenticated session, skipping realtime subscriptions", { component: logComponent });
      return null;
    }
    
    logger.info("User authenticated for realtime", { 
      userId: session.user.id,
      email: session.user.email,
      component: logComponent 
    });
    
    // Get the user's profile ID from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();
      
    if (profileError) {
      logger.error("Error fetching profile for realtime", { 
        error: profileError,
        userId: session.user.id,
        component: logComponent 
      });
      return null;
    }
    
    if (!profile) {
      logger.error("No profile found for user", { 
        userId: session.user.id,
        component: logComponent 
      });
      return null;
    }
    
    const userId = profile.id;
    logger.info("Using profile ID for subscriptions", { 
      profileId: userId,
      component: logComponent 
    });
    
    // Créer un canal unique pour éviter les doublons de souscriptions
    const channelId = `public-conversations-${userId}-${Date.now()}`;
    logger.info(`Creating channel with ID: ${channelId}`, { component: logComponent });
    
    // Créer un canal pour les tables conversations et messages
    const channel = supabase.channel(channelId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user1_id=eq.${userId}` 
      }, (payload) => {
        logger.info("Received conversation change - user1", { component: logComponent, payload });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user2_id=eq.${userId}`
      }, (payload) => {
        logger.info("Received conversation change - user2", { component: logComponent, payload });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${userId}`
      }, (payload) => {
        logger.info("Received message change - sent by user", { component: logComponent, payload });
      })
      .subscribe((status) => {
        logger.info("Subscription status", { component: logComponent, status, channelId });
        
        if (status === 'SUBSCRIBED') {
          logger.info("Successfully subscribed to realtime changes", { component: logComponent });
        } else if (status === 'CHANNEL_ERROR') {
          logger.error("Error subscribing to realtime changes", { component: logComponent });
        }
      });
      
    // Nous retournons le canal pour pouvoir se désinscrire si nécessaire
    return channel;
  } catch (error) {
    logger.error("Error setting up realtime subscriptions", { component: logComponent, error });
    return null;
  }
};
