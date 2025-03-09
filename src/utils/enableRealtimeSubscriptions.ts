
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
    
    // Use separate channels for each table to avoid issues
    try {
      // Create a channel for conversations where user is user1
      const user1Channel = supabase.channel(`conv-user1-${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user1_id=eq.${userId}` 
        }, (payload) => {
          logger.info("Received conversation change - user1", { component: logComponent, payload });
        })
        .subscribe((status) => {
          logger.info("Subscription status - user1", { component: logComponent, status });
        });
        
      // Create a channel for conversations where user is user2
      const user2Channel = supabase.channel(`conv-user2-${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user2_id=eq.${userId}`
        }, (payload) => {
          logger.info("Received conversation change - user2", { component: logComponent, payload });
        })
        .subscribe((status) => {
          logger.info("Subscription status - user2", { component: logComponent, status });
        });
      
      // Create a channel for messages sent by the user
      const messagesChannel = supabase.channel(`messages-${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${userId}`
        }, (payload) => {
          logger.info("Received message change", { component: logComponent, payload });
        })
        .subscribe((status) => {
          logger.info("Subscription status - messages", { component: logComponent, status });
        });
        
      logger.info("Successfully set up all realtime channels", { component: logComponent });
      
      // Return channels for cleanup if needed
      return [user1Channel, user2Channel, messagesChannel];
    } catch (error) {
      logger.error("Error setting up channel subscriptions", { component: logComponent, error });
      return null;
    }
  } catch (error) {
    logger.error("Error setting up realtime subscriptions", { component: logComponent, error });
    return null;
  }
};
