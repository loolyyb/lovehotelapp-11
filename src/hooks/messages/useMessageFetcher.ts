
import { supabase, safeQueryResult } from "@/integrations/supabase/client";
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
        return null;
      }

      // First check if the user has access to this conversation
      logger.info("Verifying conversation access", { 
        conversationId, 
        currentProfileId,
        component: "useMessageFetcher" 
      });

      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('id, user1_id, user2_id')
        .eq('id', conversationId)
        .single();
        
      if (conversationError) {
        logger.error("Error verifying conversation access", { 
          error: conversationError, 
          conversationId,
          component: "useMessageFetcher" 
        });
        
        if (conversationError.code === 'PGRST116') {
          toast({
            variant: "destructive",
            title: "Conversation introuvable",
            description: "Cette conversation n'existe pas ou vous n'y avez pas accès",
          });
          return null;
        }
        
        toast({
          variant: "destructive",
          title: "Erreur d'accès",
          description: "Impossible de vérifier l'accès à la conversation",
        });
        return null;
      }
      
      if (!currentProfileId) {
        logger.error("No profile ID provided", { component: "useMessageFetcher" });
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour accéder à cette conversation",
        });
        return null;
      }
      
      // Verify the user has access to this conversation
      const isParticipant = 
        conversationData.user1_id === currentProfileId || 
        conversationData.user2_id === currentProfileId;
        
      if (!isParticipant) {
        logger.error("User is not a participant in this conversation", { 
          conversationId, 
          profileId: currentProfileId,
          component: "useMessageFetcher" 
        });
        toast({
          variant: "destructive",
          title: "Accès refusé",
          description: "Vous n'êtes pas autorisé à accéder à cette conversation",
        });
        return null;
      }

      // Now fetch messages - RLS will handle permissions
      logger.info("Fetching messages for conversation", { 
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
        logger.error("Error fetching messages", { 
          error, 
          conversationId,
          component: "useMessageFetcher" 
        });
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les messages",
        });
        return null;
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
      
      // Make sure messages is always an array using our safe helper
      const typedMessages = safeQueryResult<any>(messagesData);
      setMessages(typedMessages);
      
      return typedMessages;
      
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

  return { fetchMessages };
};
