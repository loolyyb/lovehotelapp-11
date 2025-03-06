
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";

interface UseMessageRetrievalProps {
  conversationId: string;
  currentProfileId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  toast: any;
}

export const useMessageRetrieval = ({ 
  conversationId, 
  currentProfileId, 
  setMessages, 
  toast 
}: UseMessageRetrievalProps) => {
  const fetchMessages = async () => {
    try {
      logger.info("Fetching messages", { 
        conversationId, 
        currentProfileId,
        component: "useMessageRetrieval" 
      });
      
      if (!conversationId) {
        logger.error("No conversation ID provided", { component: "useMessageRetrieval" });
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "ID de conversation manquant",
        });
        return;
      }

      if (!currentProfileId) {
        logger.error("No current profile ID", { 
          conversationId, 
          component: "useMessageRetrieval" 
        });
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour accéder aux messages",
        });
        return;
      }
      
      // First get the user's profile to confirm it exists
      let profileCheck;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .eq('id', currentProfileId)
          .single();
          
        if (error) {
          // Handle profile fetch error
          logger.error("Error checking profile existence", { 
            error, 
            currentProfileId,
            component: "useMessageRetrieval" 
          });
          
          if (error.code === 'PGRST116') { // not found error
            toast({
              variant: "destructive",
              title: "Erreur",
              description: "Votre profil n'a pas été trouvé",
            });
            return;
          }
          
          // For other errors, we'll retry with a more resilient approach
          throw error;
        }
        
        profileCheck = data;
      } catch (error: any) {
        logger.error("Network error checking profile", {
          error: error.message,
          stack: error.stack,
          component: "useMessageRetrieval"
        });
        
        // Implement retry logic with user ID instead
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user?.id) {
            const { data: profileByUserId, error: userIdError } = await supabase
              .from('profiles')
              .select('id, username, full_name')
              .eq('user_id', userData.user.id)
              .single();
              
            if (userIdError) {
              AlertService.captureException(error);
              toast({
                variant: "destructive",
                title: "Erreur de connexion",
                description: "Problème de connexion au serveur. Veuillez réessayer.",
              });
              return;
            }
            
            profileCheck = profileByUserId;
          } else {
            // Still couldn't get the user
            AlertService.captureException(error);
            toast({
              variant: "destructive",
              title: "Erreur de connexion",
              description: "Problème de connexion au serveur. Veuillez réessayer.",
            });
            return;
          }
        } catch (retryError: any) {
          // Final failure
          logger.error("Failed to get profile after retry", {
            error: retryError.message,
            component: "useMessageRetrieval"
          });
          AlertService.captureException(retryError);
          toast({
            variant: "destructive",
            title: "Erreur de connexion",
            description: "Problème de connexion au serveur. Veuillez réessayer.",
          });
          return;
        }
      }
      
      if (!profileCheck) {
        logger.error("Profile not found", { 
          currentProfileId,
          component: "useMessageRetrieval" 
        });
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Votre profil n'a pas été trouvé",
        });
        return;
      }

      logger.info("User profile found", { 
        profileId: profileCheck.id,
        username: profileCheck.username,
        fullName: profileCheck.full_name,
        component: "useMessageRetrieval" 
      });
      
      // Now check if the user is a member of this conversation
      try {
        const { data: conversationCheck, error: conversationError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .or(`user1_id.eq.${currentProfileId},user2_id.eq.${currentProfileId}`)
          .maybeSingle();
        
        if (conversationError) {
          logger.error("Error checking conversation membership", { 
            error: conversationError, 
            conversationId, 
            currentProfileId,
            component: "useMessageRetrieval" 
          });
          throw conversationError;
        }
        
        if (!conversationCheck) {
          logger.info("User is not a member of this conversation", { 
            conversationId, 
            currentProfileId,
            component: "useMessageRetrieval" 
          });
          setMessages([]);
          toast({
            variant: "destructive",
            title: "Accès refusé",
            description: "Vous n'êtes pas membre de cette conversation",
          });
          return;
        }
        
        logger.info("User confirmed as member of conversation", { 
          conversation: conversationCheck, 
          currentProfileId,
          component: "useMessageRetrieval" 
        });
      } catch (error: any) {
        logger.error("Network error checking conversation", {
          error: error.message,
          stack: error.stack,
          component: "useMessageRetrieval"
        });
        AlertService.captureException(error);
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: "Problème de connexion au serveur. Veuillez réessayer.",
        });
        return;
      }
      
      // Get messages for this conversation with retries
      try {
        logger.info("Fetching messages for conversation", { 
          conversationId,
          component: "useMessageRetrieval" 
        });
        
        const fetchWithRetry = async (retryCount = 0, maxRetries = 3) => {
          try {
            const { data: messagesData, error } = await supabase
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
            
            if (error) throw error;
            return { messagesData, error: null };
          } catch (error: any) {
            if (retryCount < maxRetries) {
              logger.info(`Retrying message fetch (${retryCount + 1}/${maxRetries})`, {
                component: "useMessageRetrieval"
              });
              // Exponential backoff
              await new Promise(r => setTimeout(r, Math.pow(2, retryCount) * 500));
              return fetchWithRetry(retryCount + 1, maxRetries);
            }
            return { messagesData: null, error };
          }
        };
        
        const { messagesData, error } = await fetchWithRetry();
        
        if (error) {
          logger.error("Error fetching messages after retries", { 
            error, 
            conversationId,
            component: "useMessageRetrieval" 
          });
          throw error;
        }
        
        logger.info("Fetched messages count", { 
          count: messagesData?.length || 0, 
          conversationId,
          component: "useMessageRetrieval" 
        });
        
        if (messagesData && messagesData.length > 0) {
          logger.debug("First and last messages", { 
            first: messagesData[0], 
            last: messagesData[messagesData.length - 1],
            component: "useMessageRetrieval" 
          });
        } else {
          logger.info("No messages found for conversation", {
            conversationId,
            component: "useMessageRetrieval"
          });
        }
        
        // Make sure messages is always an array
        setMessages(messagesData || []);

        // Add delay before marking messages as read
        if (messagesData?.length > 0) {
          setTimeout(() => markMessagesAsRead(), 1000);
        }
      } catch (error: any) {
        logger.error("Network error fetching messages", {
          error: error.message,
          stack: error.stack,
          component: "useMessageRetrieval"
        });
        AlertService.captureException(error);
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: "Problème lors du chargement des messages. Veuillez réessayer.",
        });
      }
    } catch (error: any) {
      logger.error("Error in fetchMessages", { 
        error: error.message, 
        stack: error.stack,
        conversationId,
        currentProfileId,
        component: "useMessageRetrieval" 
      });
      AlertService.captureException(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les messages",
      });
    }
  };

  const markMessagesAsRead = async () => {
    if (!currentProfileId) {
      logger.info("No current profile ID, skipping mark as read", {
        component: "useMessageRetrieval"
      });
      return;
    }
    
    if (!conversationId) {
      logger.info("No conversation ID, skipping mark as read", {
        component: "useMessageRetrieval"
      });
      return;
    }

    try {
      logger.info("Marking messages as read", { 
        currentProfileId, 
        conversationId,
        component: "useMessageRetrieval" 
      });
      
      // First check if there are any unread messages
      const { data: unreadMessages, error: checkError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentProfileId)
        .is('read_at', null);

      if (checkError) {
        logger.error("Error checking unread messages", { 
          error: checkError,
          component: "useMessageRetrieval" 
        });
        throw checkError;
      }

      if (!unreadMessages || unreadMessages.length === 0) {
        logger.info("No unread messages to mark", {
          component: "useMessageRetrieval"
        });
        return;
      }

      logger.info("Found unread messages to mark as read", { 
        count: unreadMessages.length,
        messageIds: unreadMessages.map(msg => msg.id),
        component: "useMessageRetrieval" 
      });

      const { error: updateError } = await supabase
        .from('messages')
        .update({ 
          read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentProfileId)
        .is('read_at', null);

      if (updateError) {
        logger.error("Error marking messages as read", { 
          error: updateError,
          component: "useMessageRetrieval" 
        });
        throw updateError;
      }

      logger.info("Successfully marked messages as read", {
        component: "useMessageRetrieval"
      });
    } catch (error: any) {
      logger.error("Error in markMessagesAsRead", { 
        error: error.message, 
        stack: error.stack,
        component: "useMessageRetrieval" 
      });
      AlertService.captureException(error);
    }
  };

  return { fetchMessages, markMessagesAsRead };
};
