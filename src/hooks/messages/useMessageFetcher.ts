
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

      if (!currentProfileId) {
        logger.error("No profile ID provided", { component: "useMessageFetcher" });
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour accéder à cette conversation",
        });
        return null;
      }

      // Verify the conversation exists and user has access - RLS will handle permissions
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .single();
        
      if (conversationError) {
        logger.error("Error verifying conversation access", { 
          error: conversationError, 
          conversationId,
          component: "useMessageFetcher" 
        });
        
        toast({
          variant: "destructive",
          title: "Accès non autorisé",
          description: "Vous n'avez pas accès à cette conversation",
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
