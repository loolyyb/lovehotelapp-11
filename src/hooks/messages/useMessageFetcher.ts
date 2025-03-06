
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";

interface UseMessageFetcherProps {
  conversationId: string;
  currentProfileId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  toast: any;
}

export const useMessageFetcher = ({ 
  conversationId, 
  currentProfileId, 
  setMessages, 
  toast 
}: UseMessageFetcherProps) => {
  const fetchMessages = async () => {
    try {
      logger.info("Fetching messages", { 
        conversationId, 
        currentProfileId,
        component: "useMessageFetcher" 
      });
      
      if (!conversationId) {
        logger.error("No conversation ID provided", { component: "useMessageFetcher" });
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
          component: "useMessageFetcher" 
        });
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour accéder aux messages",
        });
        return;
      }
      
      // First get the user's profile to confirm it exists
      const profileCheck = await validateUserProfile(currentProfileId, toast);
      if (!profileCheck) return;

      // Now check if the user is a member of this conversation
      const conversationCheck = await validateConversationMembership(
        conversationId,
        currentProfileId,
        setMessages,
        toast
      );
      if (!conversationCheck) return;
      
      // Get messages for this conversation with retries
      await fetchMessagesWithRetry(conversationId, setMessages, toast);
      
    } catch (error: any) {
      logger.error("Error in fetchMessages", { 
        error: error.message, 
        stack: error.stack,
        conversationId,
        currentProfileId,
        component: "useMessageFetcher" 
      });
      AlertService.captureException(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les messages",
      });
    }
  };

  return { fetchMessages };
};

// Helper function to validate user profile
const validateUserProfile = async (currentProfileId: string, toast: any) => {
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
        component: "useMessageFetcher" 
      });
      
      if (error.code === 'PGRST116') { // not found error
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Votre profil n'a pas été trouvé",
        });
        return null;
      }
      
      // For other errors, we'll retry with a more resilient approach
      return await retryProfileFetch(toast);
    }
    
    return data;
  } catch (error: any) {
    logger.error("Network error checking profile", {
      error: error.message,
      stack: error.stack,
      component: "useMessageFetcher"
    });
    
    // Implement retry logic with user ID instead
    return await retryProfileFetch(toast);
  }
};

// Retry profile fetch using user ID
const retryProfileFetch = async (toast: any) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.id) {
      const { data: profileByUserId, error: userIdError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('user_id', userData.user.id)
        .single();
        
      if (userIdError) {
        AlertService.captureException(userIdError);
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: "Problème de connexion au serveur. Veuillez réessayer.",
        });
        return null;
      }
      
      return profileByUserId;
    } else {
      // Still couldn't get the user
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Problème de connexion au serveur. Veuillez réessayer.",
      });
      return null;
    }
  } catch (retryError: any) {
    // Final failure
    logger.error("Failed to get profile after retry", {
      error: retryError.message,
      component: "useMessageFetcher"
    });
    AlertService.captureException(retryError);
    toast({
      variant: "destructive",
      title: "Erreur de connexion",
      description: "Problème de connexion au serveur. Veuillez réessayer.",
    });
    return null;
  }
};

// Validate conversation membership
const validateConversationMembership = async (
  conversationId: string,
  currentProfileId: string,
  setMessages: React.Dispatch<React.SetStateAction<any[]>>,
  toast: any
) => {
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
        component: "useMessageFetcher" 
      });
      throw conversationError;
    }
    
    if (!conversationCheck) {
      logger.info("User is not a member of this conversation", { 
        conversationId, 
        currentProfileId,
        component: "useMessageFetcher" 
      });
      setMessages([]);
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'êtes pas membre de cette conversation",
      });
      return null;
    }
    
    logger.info("User confirmed as member of conversation", { 
      conversation: conversationCheck, 
      currentProfileId,
      component: "useMessageFetcher" 
    });
    
    return conversationCheck;
  } catch (error: any) {
    logger.error("Network error checking conversation", {
      error: error.message,
      stack: error.stack,
      component: "useMessageFetcher"
    });
    AlertService.captureException(error);
    toast({
      variant: "destructive",
      title: "Erreur de connexion",
      description: "Problème de connexion au serveur. Veuillez réessayer.",
    });
    return null;
  }
};

// Fetch messages with retry
const fetchMessagesWithRetry = async (
  conversationId: string,
  setMessages: React.Dispatch<React.SetStateAction<any[]>>,
  toast: any
) => {
  try {
    logger.info("Fetching messages for conversation", { 
      conversationId,
      component: "useMessageFetcher" 
    });
    
    const fetchWithRetry = async (retryCount = 0, maxRetries = 3) => {
      try {
        logger.info("Attempting to fetch messages", {
          attempt: retryCount + 1,
          conversationId,
          component: "useMessageFetcher"
        });
        
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            read_at,
            sender_id,
            conversation_id,
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
        
        if (error) {
          logger.error("Error in fetch attempt", {
            error,
            attempt: retryCount + 1,
            component: "useMessageFetcher"
          });
          throw error;
        }
        
        logger.info("Messages fetch successful", {
          messagesCount: messagesData?.length || 0,
          conversationId,
          component: "useMessageFetcher"
        });
        
        return { messagesData, error: null };
      } catch (error: any) {
        if (retryCount < maxRetries) {
          logger.info(`Retrying message fetch (${retryCount + 1}/${maxRetries})`, {
            error: error.message,
            component: "useMessageFetcher"
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
        component: "useMessageFetcher" 
      });
      throw error;
    }
    
    logger.info("Fetched messages count", { 
      count: messagesData?.length || 0, 
      conversationId,
      component: "useMessageFetcher" 
    });
    
    if (messagesData && messagesData.length > 0) {
      logger.debug("First and last messages", { 
        first: messagesData[0], 
        last: messagesData[messagesData.length - 1],
        component: "useMessageFetcher" 
      });
    } else {
      logger.info("No messages found for conversation", {
        conversationId,
        component: "useMessageFetcher"
      });
    }
    
    // Make sure messages is always an array
    setMessages(messagesData || []);
    
    return messagesData;
  } catch (error: any) {
    logger.error("Network error fetching messages", {
      error: error.message,
      stack: error.stack,
      component: "useMessageFetcher"
    });
    AlertService.captureException(error);
    toast({
      variant: "destructive",
      title: "Erreur de connexion",
      description: "Problème lors du chargement des messages. Veuillez réessayer.",
    });
    return null;
  }
};
