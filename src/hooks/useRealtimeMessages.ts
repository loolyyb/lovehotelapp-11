
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeMessagesProps {
  onNewMessage?: (message: any) => void;
  onMessageUpdate?: (message: any) => void;
  currentProfileId?: string | null;
}

interface RealtimePayload extends RealtimePostgresChangesPayload<{
  [key: string]: any;
}> {
  new: {
    id: string;
    [key: string]: any;
  } | null;
  old: {
    id: string;
    [key: string]: any;
  } | null;
}

export const useRealtimeMessages = ({ 
  onNewMessage, 
  onMessageUpdate,
  currentProfileId 
}: UseRealtimeMessagesProps) => {
  const logger = useLogger("useRealtimeMessages");

  useEffect(() => {
    if (!currentProfileId) {
      logger.info("No current profile ID, skipping realtime subscription");
      return;
    }

    logger.info("Setting up realtime messages subscription", { currentProfileId });

    const channel = supabase
      .channel('messages-changes')
      .on<any>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        async (payload: RealtimePayload) => {
          logger.info("Message change received", { 
            eventType: payload.eventType,
            messageId: payload.new?.id 
          });

          if (!payload.new) return;

          // Fetch complete message data with sender details
          const { data: message, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey (
                id,
                username,
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .maybeSingle();

          if (error) {
            logger.error("Error fetching message details", { error });
            return;
          }

          if (!message) {
            logger.warn("No message found after change", { messageId: payload.new.id });
            return;
          }

          // Notify appropriate handler based on event type
          if (payload.eventType === 'INSERT') {
            onNewMessage?.(message);
          } else if (payload.eventType === 'UPDATE') {
            onMessageUpdate?.(message);
          }
        }
      )
      .subscribe((status) => {
        logger.info("Realtime subscription status", { status });
      });

    return () => {
      logger.info("Cleaning up realtime messages subscription");
      supabase.removeChannel(channel);
    };
  }, [currentProfileId, onNewMessage, onMessageUpdate]);
};
