
import { useState, useCallback } from "react";
import { useLogger } from "@/hooks/useLogger";
import { useConversationData } from "@/hooks/conversations/useConversationData";
import { AlertService } from "@/services/AlertService";
import { useProfileState } from "@/hooks/useProfileState";

interface UseConversationInitProps {
  conversationId: string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setCurrentProfileId: (profileId: string | null) => void;
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
  const logger = useLogger("useConversationInit");
  const { profileId, refreshProfile } = useProfileState();
  
  const { fetchConversationDetails } = useConversationData({
    conversationId,
    currentProfileId: profileId, 
    setOtherUser,
  });

  const getCurrentUser = useCallback(async () => {
    try {
      logger.info("Getting current user profile", {
        conversationId
      });
      
      if (!profileId) {
        logger.info("No profile ID found, refreshing profile");
        await refreshProfile();
      }
      
      if (profileId) {
        logger.info("Using profile ID from centralized state", { profileId });
        setCurrentProfileId(profileId);
        
        // Fetch conversation details
        await fetchConversationDetails();
      } else {
        logger.error("Could not get profile ID");
        setIsLoading(false);
      }
      
    } catch (error: any) {
      logger.error("Exception in getCurrentUser", { 
        error: error.message,
        stack: error.stack,
        component: "useConversationInit"
      });
      AlertService.captureException(error);
      setIsLoading(false);
    }
  }, [conversationId, profileId, refreshProfile, setCurrentProfileId, fetchConversationDetails, setIsLoading, logger]);

  return { getCurrentUser };
};
