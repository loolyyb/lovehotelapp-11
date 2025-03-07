
import { useState, useCallback } from "react";
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

  // Function to refresh messages manually
  const refreshMessages = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setIsError(false);
    
    try {
      logger.info("Manually refreshing messages", { conversationId });
      await fetchMessages();
      
      logger.info("Messages refreshed successfully", { 
        conversationId,
        hasProfile: !!currentProfileId
      });
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
  }, [conversationId, fetchMessages, isRefreshing, currentProfileId, logger, toast]);

  // Try again in case of error
  const retryLoad = useCallback(async () => {
    setIsError(false);
    setIsLoading(true);
    
    try {
      logger.info("Retrying conversation load", { conversationId });
      
      // First reinitialize the user profile
      await getCurrentUser();
      
      // Then fetch messages if we have a profile ID
      if (currentProfileId) {
        logger.info("Retrying message fetch", { 
          profileId: currentProfileId,
          conversationId 
        });
        await fetchMessages();
      } else {
        logger.warn("No profile ID when retrying load", { conversationId });
        // Still allow UI to render even if profile ID is missing
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
  }, [conversationId, getCurrentUser, currentProfileId, fetchMessages, logger, toast]);

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
