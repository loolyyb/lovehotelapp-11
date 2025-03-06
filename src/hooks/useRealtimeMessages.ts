
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/LogService';

interface UseRealtimeMessagesProps {
  currentProfileId: string | null;
  onNewMessage?: (message: any) => void;
  onMessageUpdate?: (message: any) => void;
}

export const useRealtimeMessages = ({
  currentProfileId,
  onNewMessage,
  onMessageUpdate
}: UseRealtimeMessagesProps) => {
  const channelRef = useRef<any>(null);
  const logComponent = 'useRealtimeMessages';

  useEffect(() => {
    // Ne pas s'abonner si aucun ID de profil n'est disponible
    if (!currentProfileId) {
      logger.info("No current profile ID, skipping realtime subscription", { component: logComponent });
      return;
    }

    // Créer un identifiant unique pour le canal
    const channelId = `messages-updates-${currentProfileId}-${Date.now()}`;
    logger.info(`Setting up message realtime subscription: ${channelId}`, { component: logComponent });

    // Récupérer la session pour l'authentification
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        logger.error("No authenticated session found for realtime subscription", { component: logComponent });
        return;
      }

      // Créer le canal pour les messages
      const channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            if (payload.new) {
              // Vérifier si le message fait partie d'une conversation de l'utilisateur
              const conversationId = payload.new.conversation_id;
              
              logger.info("New message received via realtime", { 
                component: logComponent,
                messageId: payload.new.id,
                conversation: conversationId
              });
              
              if (onNewMessage) onNewMessage(payload.new);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            if (payload.new) {
              logger.info("Message update received via realtime", { 
                component: logComponent,
                messageId: payload.new.id,
                conversation: payload.new.conversation_id 
              });
              if (onMessageUpdate) onMessageUpdate(payload.new);
            }
          }
        )
        .subscribe((status) => {
          logger.info("Message subscription status", { component: logComponent, status, channelId });
        });

      // Sauvegarder la référence du canal pour pouvoir le désabonner plus tard
      channelRef.current = channel;
    }).catch(error => {
      logger.error("Error getting auth session for realtime subscription", { component: logComponent, error });
    });

    // Nettoyer l'abonnement lorsque le composant est démonté
    return () => {
      logger.info(`Removing message subscription: ${channelId}`, { component: logComponent });
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentProfileId, onNewMessage, onMessageUpdate]);

  // Ce hook ne renvoie rien car il gère uniquement les abonnements
  return null;
};
