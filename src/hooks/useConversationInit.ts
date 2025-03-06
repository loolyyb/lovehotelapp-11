
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";
import { useProfileRetrieval } from "./conversations/useProfileRetrieval";
import { useConversationData } from "./conversations/useConversationData";
import { useInitialMessages } from "./conversations/useInitialMessages";
import { useEffect, useState } from "react";
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
  const [sessionChecked, setSessionChecked] = useState(false);
  
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

  // First effect: Check user session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error("Error checking session", {
            error,
            component: "useConversationInit"
          });
          return;
        }
        
        if (!data.session) {
          logger.warn("No active session found", {
            component: "useConversationInit"
          });
        } else {
          logger.info("Active session found", {
            userId: data.session.user.id,
            component: "useConversationInit"
          });
        }
      } catch (error) {
        logger.error("Session check error", {
          error,
          component: "useConversationInit"
        });
      } finally {
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, []);

  // Second effect: Initialize user profile
  useEffect(() => {
    if (!sessionChecked) return;
    
    const initUserProfile = async () => {
      try {
        const profileId = await getCurrentUserProfile();
        if (profileId) {
          logger.info("User profile retrieved successfully", {
            profileId,
            component: "useConversationInit"
          });
          setInternalProfileId(profileId);
          setCurrentProfileId(profileId);
        } else {
          logger.warn("No user profile found", {
            component: "useConversationInit"
          });
        }
      } catch (error) {
        logger.error("Error getting user profile", { 
          error, 
          component: "useConversationInit" 
        });
      }
    };
    
    initUserProfile();
  }, [sessionChecked]);

  // Effect to load conversation when profile ID is available
  useEffect(() => {
    if (internalProfileId && conversationId) {
      getCurrentUser();
    }
  }, [internalProfileId, conversationId]);

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
        profileId: internalProfileId,
        component: "useConversationInit" 
      });
      
      // Fetch initial messages and conversation details in parallel
      const results = await Promise.allSettled([
        fetchInitialMessages(),
        fetchConversationDetails()
      ]);
      
      if (results[0].status === 'rejected') {
        logger.error("Failed to fetch initial messages", {
          error: results[0].reason,
          component: "useConversationInit"
        });
        setMessages([]);
      } else if (results[0].status === 'fulfilled' && !results[0].value) {
        // If we got no messages (null or empty array), set empty messages array
        setMessages([]);
      }
      
      if (results[1].status === 'rejected') {
        logger.error("Failed to fetch conversation details", {
          error: results[1].reason,
          component: "useConversationInit"
        });
      }
      
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
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { getCurrentUser };
};
