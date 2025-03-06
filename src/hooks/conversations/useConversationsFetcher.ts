
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { AlertService } from "@/services/AlertService";

export const useConversationsFetcher = (profileId: string | null) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logger = useLogger("useConversationsFetcher");

  const fetchConversations = useCallback(async (retryCount = 0, maxRetries = 5) => {
    if (!profileId) {
      logger.info("No profile ID provided, skipping conversations fetch");
      return [];
    }
    
    try {
      setIsLoading(true);
      setError(null);
      logger.info("Fetching conversations", { 
        profileId, 
        timestamp: new Date().toISOString() 
      });
      
      // Get conversations with retries
      const getConversations = async (attempts = 0): Promise<any[]> => {
        try {
          const { data: conversationsData, error: conversationsError } = await supabase
            .from('conversations')
            .select(`
              *,
              user1:profiles!conversations_user1_id_fkey(id, username, full_name, avatar_url),
              user2:profiles!conversations_user2_id_fkey(id, username, full_name, avatar_url)
            `)
            .or(`user1_id.eq.${profileId},user2_id.eq.${profileId}`)
            .eq('status', 'active')
            .order('updated_at', { ascending: false });

          if (conversationsError) {
            throw conversationsError;
          }
          
          return conversationsData || [];
        } catch (error: any) {
          logger.error(`Error fetching conversations (attempt ${attempts + 1})`, {
            error: error.message,
            code: error.code,
            component: "useConversationsFetcher"
          });
          
          if (attempts < maxRetries) {
            logger.info(`Retrying conversations fetch (${attempts + 1}/${maxRetries})`, { 
              component: "useConversationsFetcher"
            });
            
            // Wait with exponential backoff before retrying
            await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempts), 10000)));
            return getConversations(attempts + 1);
          }
          
          throw error;
        }
      };
      
      const conversationsData = await getConversations();
      
      logger.info("Fetched conversations", { 
        count: conversationsData?.length || 0,
        component: "useConversationsFetcher" 
      });
      
      // Filter to exclude conversations with self
      const filteredData = conversationsData?.filter(conversation => 
        conversation.user1_id !== conversation.user2_id
      ) || [];
      
      logger.info("Filtered conversations before messages", { 
        count: filteredData.length,
        conversationIds: filteredData.map(c => c.id),
        component: "useConversationsFetcher"
      });
      
      return filteredData;
    } catch (error: any) {
      logger.error("Error fetching conversations", { 
        error: error.message, 
        stack: error.stack,
        component: "useConversationsFetcher",
        retryCount 
      });
      
      if (retryCount < maxRetries) {
        logger.info(`Retrying conversations fetch (${retryCount + 1}/${maxRetries})`, { 
          component: "useConversationsFetcher"
        });
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 10000)));
        return fetchConversations(retryCount + 1, maxRetries);
      }
      
      AlertService.captureException(error);
      setError("Impossible de charger les conversations. Veuillez vérifier votre connexion et réessayer.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [profileId, logger]);

  return {
    conversations,
    setConversations,
    isLoading,
    error,
    fetchConversations
  };
};
