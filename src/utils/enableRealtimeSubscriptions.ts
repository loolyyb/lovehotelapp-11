
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";

/**
 * Active les abonnements temps réel pour les tables de conversation
 * Cette fonction doit être appelée au démarrage de l'application
 */
export const enableRealtimeSubscriptions = async () => {
  const logger = useLogger("enableRealtimeSubscriptions");
  
  try {
    // Activer les abonnements temps réel pour les conversations et messages
    const { data, error } = await supabase.rpc(
      'supabase_functions.http_request',
      {
        method: 'POST',
        url: '/rest/v1/rpc/enable_realtime_tables',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tables: ['conversations', 'messages']
        })
      }
    );
    
    if (error) {
      logger.error("Failed to enable realtime subscriptions", { error });
      return;
    }
    
    logger.info("Successfully enabled realtime subscriptions", { data });
  } catch (error) {
    logger.error("Error enabling realtime subscriptions", { error });
  }
};
