
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";

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
  const getCurrentUser = async () => {
    if (!conversationId) {
      logger.info("No conversation ID provided", {
        component: "useConversationInit"
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        logger.error("Auth error getting current user", { 
          error: authError,
          component: "useConversationInit" 
        });
        throw authError;
      }
      
      if (!user) {
        logger.error("No authenticated user found", {
          component: "useConversationInit"
        });
        setIsLoading(false);
        return;
      }

      logger.info("User authenticated", { 
        userId: user.id,
        component: "useConversationInit" 
      });

      // Get user profile ID from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        logger.error("Error fetching user profile", { 
          error: profileError,
          userId: user.id,
          component: "useConversationInit" 
        });
        throw profileError;
      }

      if (!profile) {
        logger.error("User profile not found", { 
          userId: user.id,
          component: "useConversationInit" 
        });
        setIsLoading(false);
        return;
      }

      logger.info("Found user profile", { 
        profileId: profile.id,
        userId: user.id,
        component: "useConversationInit" 
      });
      
      setCurrentProfileId(profile.id);

      // Get initial messages directly to show something quickly
      const { data: initialMessages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read_at,
          sender_id,
          media_type,
          media_url,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        logger.error("Error fetching initial messages", { 
          error: messagesError,
          conversationId,
          component: "useConversationInit" 
        });
      } else if (initialMessages?.length) {
        logger.info("Loaded initial messages", { 
          count: initialMessages.length,
          conversationId,
          component: "useConversationInit" 
        });
        setMessages(initialMessages);
      }

      // Fetch user profile and conversation details in parallel
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
          component: "useConversationInit" 
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
          component: "useConversationInit" 
        });
        
        if (profile) {
          const otherUserData = conversation.user1.id === profile.id 
            ? conversation.user2 
            : conversation.user1;
            
          logger.info("Setting other user data", { 
            otherUserId: otherUserData.id,
            otherUsername: otherUserData.username,
            component: "useConversationInit" 
          });
          
          setOtherUser(otherUserData);
        }
      } else {
        logger.error("Conversation not found", { 
          conversationId,
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
    } finally {
      setIsLoading(false);
    }
  };

  return { getCurrentUser };
};
