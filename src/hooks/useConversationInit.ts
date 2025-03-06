
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";
import { useProfileRetrieval } from "./conversations/useProfileRetrieval";
import { useConversationData } from "./conversations/useConversationData";
import { useInitialMessages } from "./conversations/useInitialMessages";
import { useEffect, useState } from "react";

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
  const [internalProfileId, setInternalProfileId] = useState<string | null>(null);
  
  const { getCurrentUserProfile } = useProfileRetrieval({
    setCurrentProfileId: (profileId) => {
      setInternalProfileId(profileId);
      setCurrentProfileId(profileId);
    }
  });
  
  const { fetchConversationDetails } = useConversationData({
    conversationId,
    currentProfileId: internalProfileId,
    setOtherUser
  });
  
  const { fetchInitialMessages } = useInitialMessages({
    conversationId,
    setMessages
  });

  // Effect to update internalProfileId when the external one changes
  useEffect(() => {
    const initConversation = async () => {
      try {
        const profileId = await getCurrentUserProfile();
        if (profileId) {
          setInternalProfileId(profileId);
          setCurrentProfileId(profileId);
        }
      } catch (error) {
        logger.error("Error getting user profile", { 
          error, 
          component: "useConversationInit" 
        });
      }
    };
    
    initConversation();
  }, []);

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
      
      // Update our internal state as well
      setInternalProfileId(profileId);
      
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
