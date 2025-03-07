
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";

/**
 * Build a query for fetching messages with optimized selection
 */
export const buildMessageQuery = () => {
  return supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      read_at,
      sender_id,
      conversation_id,
      media_type,
      media_url,
      sender:profiles!messages_sender_id_fkey (
        id,
        username,
        full_name,
        avatar_url
      )
    `);
};

/**
 * Log query errors and provide consistent error handling
 */
export const handleQueryError = (error: any, context: string) => {
  logger.error(`Error ${context}`, { 
    error, 
    component: "messageQueryBuilder" 
  });
  return null;
};
