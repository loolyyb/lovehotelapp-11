
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

  // Effect to verify access to conversation for security
  useEffect(() => {
    const verifyAccess = async () => {
      if (!conversationId || !internalProfileId) return;
      
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('id')
          .eq('id', conversationId)
          .or(`user1_id.eq.${internalProfileId},user2_id.eq.${internalProfileId}`)
          .maybeSingle();
          
        if (error || !data) {
          logger.error("User doesn't have access to this conversation", {
            profileId: internalProfileId,
            conversationId,
            component: "useConversationInit"
          });
          setMessages([]);
        }
      } catch (error) {
        logger.error("Error verifying conversation access", {
          error,
          component: "useConversationInit"
        });
      }
    };
    
    verifyAccess();
  }, [conversationId, internalProfileId]);

  // Effect to update internalProfileId when the external one changes
  useEffect(() => {
    const initConversation = async () => {
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
        setMessages([]);
        setIsLoading(false);
        return;
      }
      
      // Update our internal state as well
      setInternalProfileId(profileId);
      
      // First check if user has access to this conversation
      const { data: accessCheck, error: accessError } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .or(`user1_id.eq.${profileId},user2_id.eq.${profileId}`)
        .maybeSingle();
      
      if (accessError || !accessCheck) {
        logger.error("User does not have access to this conversation", {
          profileId,
          conversationId,
          component: "useConversationInit"
        });
        setMessages([]);
        setIsLoading(false);
        return;
      }
      
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
