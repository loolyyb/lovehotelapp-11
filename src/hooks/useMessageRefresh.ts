
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLogger } from "@/hooks/useLogger";

interface UseMessageRefreshProps {
  conversationId: string;
  fetchMessages: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  currentProfileId: string | null;
}

export const useMessageRefresh = ({
  conversationId,
  fetchMessages,
  getCurrentUser,
  currentProfileId,
}: UseMessageRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const logger = useLogger("MessageRefresh");

  // Fonction pour rafraîchir manuellement les messages
  const refreshMessages = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setIsError(false);
    
    try {
      logger.info("Manually refreshing messages", { conversationId });
      await fetchMessages();
    } catch (error: any) {
      logger.error("Error refreshing messages", { 
        error: error.message,
        stack: error.stack,
        conversationId 
      });
      setIsError(true);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de rafraîchir les messages"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Essayer à nouveau en cas d'erreur
  const retryLoad = async () => {
    setIsError(false);
    setIsLoading(true);
    
    try {
      logger.info("Retrying conversation load", { conversationId });
      await getCurrentUser();
      
      if (currentProfileId) {
        logger.info("Retrying message fetch", { 
          profileId: currentProfileId,
          conversationId 
        });
        await fetchMessages();
      } else {
        logger.warn("No profile ID when retrying load", { conversationId });
      }
    } catch (error: any) {
      logger.error("Error retrying load", { 
        error: error.message,
        stack: error.stack,
        conversationId 
      });
      setIsError(true);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger la conversation"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    isRefreshing, 
    isError, 
    isLoading, 
    setIsError, 
    setIsLoading, 
    refreshMessages, 
    retryLoad 
  };
};
