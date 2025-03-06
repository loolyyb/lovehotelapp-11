
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";
import { useProfileRetrieval } from "./conversations/useProfileRetrieval";
import { useConversationData } from "./conversations/useConversationData";
import { useInitialMessages } from "./conversations/useInitialMessages";

interface UseConversationInitProps {
  conversationId: string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setCurrentProfileId: React.Dispatch<React.SetStateAction<string | null>>;
  setOtherUser: React.Dispatch<React.SetStateAction<any>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useConversationInit = ({
  conversationId,
  setMessages,
  setCurrentProfileId,
  setOtherUser,
  setIsLoading,
}: UseConversationInitProps) => {
  const { getCurrentUserProfile } = useProfileRetrieval({
    setCurrentProfileId
  });
  
  const { fetchConversationDetails } = useConversationData({
    conversationId,
    currentProfileId: null, // Will be set during execution
    setOtherUser
  });
  
  const { fetchInitialMessages } = useInitialMessages({
    conversationId,
    setMessages
  });

  const getCurrentUser = async () => {
    if (!conversationId) {
      logger.info("No conversation ID provided", {
        component: "useConversationInit"
      });
      setIsLoading(false);
      return;
    }

    try {
      logger.info("Initializing conversation", { 
        conversationId,
        component: "useConversationInit" 
      });
      
      // Get current user profile
      const profileId = await getCurrentUserProfile();
      
      if (!profileId) {
        logger.info("No profile ID retrieved", {
          conversationId,
          component: "useConversationInit"
        });
        setIsLoading(false);
        return;
      }
      
      // Fetch initial messages and conversation details in parallel
      await Promise.all([
        fetchInitialMessages(),
        fetchConversationDetails()
      ]);
      
    } catch (error: any) {
      logger.error("Error in getCurrentUser", { 
        error: error.message,
        stack: error.stack,
        conversationId,
        component: "useConversationInit" 
      });
      AlertService.captureException(error, { 
        conversationId,
        component: "useConversationInit"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { getCurrentUser };
};
