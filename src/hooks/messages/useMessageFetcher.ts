
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

      // Check if profile is valid and get the current auth user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.error("No authenticated user", { component: "useMessageFetcher" });
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Votre session a expiré. Veuillez vous reconnecter.",
        });
        return null;
      }

      logger.info("User authenticated, checking conversation access", { 
        authUserId: user.id,
        profileId: currentProfileId,
        component: "useMessageFetcher"
      });

      // Verify the conversation exists and user has access
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
        
        toast({
          variant: "destructive",
          title: "Accès non autorisé",
          description: "Vous n'avez pas accès à cette conversation",
        });
        return null;
      }

      // Verify current user is part of this conversation
      if (conversationData && conversationData.user1_id !== currentProfileId && conversationData.user2_id !== currentProfileId) {
        logger.error("User not part of conversation", {
          conversationId,
          currentProfileId,
          conversation: conversationData,
          component: "useMessageFetcher"
        });
        
        toast({
          variant: "destructive",
          title: "Accès non autorisé",
          description: "Vous n'êtes pas autorisé à accéder à cette conversation",
        });
        return null;
      }

      // Now fetch messages
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

  return { fetchMessages };
};
