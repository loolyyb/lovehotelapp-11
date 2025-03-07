
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";
import { useProfileRetrieval } from "./conversations/useProfileRetrieval";
import { useConversationData } from "./conversations/useConversationData";
import { useInitialMessages } from "./conversations/useInitialMessages";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  const getCurrentUser = useCallback(async () => {
    try {
      logger.info("Initializing user profile", { 
        conversationId,
        component: "useConversationInit" 
      });
      
      const profileId = await getCurrentUserProfile();
      
      if (!profileId) {
        logger.error("Could not retrieve user profile ID", { 
          conversationId,
          component: "useConversationInit" 
        });
        return;
      }
      
      logger.info("User profile retrieved successfully", {
        profileId,
        conversationId,
        component: "useConversationInit"
      });
      
      // Now that we have the profile ID, fetch conversation details
      await fetchConversationDetails();
      
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
      // Only when we've finished this initial setup, we allow messaging to proceed
      // even if there was an error, so the UI doesn't break
    }
  }, [conversationId, getCurrentUserProfile, fetchConversationDetails]);

  return { getCurrentUser };
};
