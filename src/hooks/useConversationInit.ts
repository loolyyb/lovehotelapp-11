
import { useState, useCallback } from "react";
import { useLogger } from "@/hooks/useLogger";
import { supabase } from "@/integrations/supabase/client";
import { useConversationData } from "@/hooks/conversations/useConversationData";
import { AlertService } from "@/services/AlertService";

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
  
  const { fetchConversationDetails } = useConversationData({
    conversationId,
    currentProfileId: null, // Will be updated once profile is retrieved
    setOtherUser,
  });

  const getCurrentUser = useCallback(async () => {
    try {
      logger.info("Getting current user profile", {
        conversationId
      });
      
      // Get the current authenticated user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        logger.error("Authentication error", { 
          error: authError,
          component: "useConversationInit"
        });
        setIsLoading(false);
        return;
      }
      
      if (!authData.user) {
        logger.info("No authenticated user found", {
          component: "useConversationInit"
        });
        setIsLoading(false);
        return;
      }
      
      // Get user's profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', authData.user.id)
        .single();
        
      if (profileError) {
        logger.error("Error getting user profile", { 
          error: profileError,
          userId: authData.user.id,
          component: "useConversationInit"
        });
        setIsLoading(false);
        return;
      }
      
      if (!profileData) {
        logger.error("No profile found for user", { 
          userId: authData.user.id,
          component: "useConversationInit"
        });
        setIsLoading(false);
        return;
      }
      
      logger.info("Retrieved user profile", { 
        profileId: profileData.id,
        component: "useConversationInit"
      });
      
      // Set the current profile ID
      setCurrentProfileId(profileData.id);
      
      // Fetch conversation details
      await fetchConversationDetails();
      
    } catch (error: any) {
      logger.error("Exception in getCurrentUser", { 
        error: error.message,
        stack: error.stack,
        component: "useConversationInit"
      });
      AlertService.captureException(error);
      setIsLoading(false);
    }
  }, [conversationId, setCurrentProfileId, fetchConversationDetails, setIsLoading, logger]);

  return { getCurrentUser };
};
