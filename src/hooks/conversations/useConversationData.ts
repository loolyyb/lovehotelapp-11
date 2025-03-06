
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";
import { useEffect, useState } from "react";

interface UseConversationDataProps {
  conversationId: string;
  currentProfileId: string | null;
  setOtherUser: React.Dispatch<React.SetStateAction<any>>;
}

export const useConversationData = ({
  conversationId,
  currentProfileId,
  setOtherUser
}: UseConversationDataProps) => {
  const [localProfileId, setLocalProfileId] = useState<string | null>(currentProfileId);

  useEffect(() => {
    if (currentProfileId && currentProfileId !== localProfileId) {
      setLocalProfileId(currentProfileId);
      // If we get a new profile ID, fetch the conversation details
      if (conversationId) {
        fetchConversationDetails();
      }
    }
  }, [currentProfileId, conversationId]);

  const fetchConversationDetails = async () => {
    const effectiveProfileId = localProfileId || currentProfileId;
    
    if (!conversationId) {
      logger.info("Missing conversationId for fetchConversationDetails", {
        component: "useConversationData"
      });
      return null;
    }

    if (!effectiveProfileId) {
      logger.info("Missing currentProfileId for fetchConversationDetails, will retry when available", {
        conversationId,
        component: "useConversationData"
      });
      return null;
    }

    try {
      logger.info("Fetching conversation details", { 
        conversationId,
        profileId: effectiveProfileId,
        component: "useConversationData" 
      });
      
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!conversations_user1_profile_fkey(id, username, full_name, avatar_url),
          user2:profiles!conversations_user2_profile_fkey(id, username, full_name, avatar_url)
        `)
        .eq('id', conversationId)
        .maybeSingle();

      if (convError) {
        logger.error("Error fetching conversation details", { 
          error: convError,
          conversationId,
          component: "useConversationData" 
        });
        throw convError;
      }

      if (conversation) {
        logger.info("Loaded conversation details", { 
          conversation: {
            id: conversation.id,
            user1_id: conversation.user1_id,
            user2_id: conversation.user2_id
          },
          component: "useConversationData" 
        });
        
        const otherUserData = conversation.user1.id === effectiveProfileId 
          ? conversation.user2 
          : conversation.user1;
          
        logger.info("Setting other user data", { 
          otherUserId: otherUserData.id,
          otherUsername: otherUserData.username,
          component: "useConversationData" 
        });
        
        setOtherUser(otherUserData);
        return conversation;
      } else {
        logger.error("Conversation not found", { 
          conversationId,
          component: "useConversationData" 
        });
        return null;
      }
    } catch (error: any) {
      logger.error("Error in fetchConversationDetails", { 
        error: error.message,
        stack: error.stack,
        conversationId,
        component: "useConversationData" 
      });
      AlertService.captureException(error, { 
        conversationId,
        component: "useConversationData"
      });
      return null;
    }
  };

  return { fetchConversationDetails };
};
