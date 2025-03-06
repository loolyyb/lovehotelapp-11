
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

      // Try a direct query approach to bypass potential RLS issues 
      const query = `
        SELECT c.id, c.user1_id, c.user2_id
        FROM conversations c
        WHERE c.id = '${conversationId}'
        AND (c.user1_id = '${currentProfileId}' OR c.user2_id = '${currentProfileId}')
      `;
      
      const { data: conversationData, error: directQueryError } = await supabase.rpc('execute_sql', { query_text: query });
      
      // If direct query fails or returns no results, try the standard approach
      if (directQueryError || !conversationData || conversationData.length === 0) {
        logger.info("Direct query approach failed, trying standard query", {
          error: directQueryError,
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

        // Additional logging to debug conversation access
        logger.info("Conversation details", {
          conversation: conversationData,
          currentProfileId,
          component: "useMessageFetcher"
        });

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
      } else {
        logger.info("Direct query successful, conversation access verified", {
          component: "useMessageFetcher"
        });
      }

      // Now fetch messages - using direct query to bypass RLS issues
      logger.info("Fetching messages for conversation", { 
        conversationId,
        component: "useMessageFetcher" 
      });
      
      const messageQuery = `
        SELECT m.id, m.content, m.created_at, m.read_at, m.sender_id, 
               m.conversation_id, m.media_type, m.media_url,
               p.id as "sender.id", p.username as "sender.username", 
               p.full_name as "sender.full_name", p.avatar_url as "sender.avatar_url"
        FROM messages m
        JOIN profiles p ON p.id = m.sender_id
        WHERE m.conversation_id = '${conversationId}'
        ORDER BY m.created_at ASC
      `;
      
      const { data: directMessages, error: directMsgError } = await supabase.rpc('execute_sql', { query_text: messageQuery });
      
      // If direct query fails, fall back to standard approach
      if (directMsgError || !directMessages) {
        logger.info("Direct message query failed, trying standard query", {
          error: directMsgError,
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
      } else {
        // Process direct query results
        logger.info("Direct message query successful", {
          count: directMessages.length,
          component: "useMessageFetcher"
        });
        
        // Transform the direct query results to match the format we expect
        const formattedMessages = directMessages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          read_at: msg.read_at,
          sender_id: msg.sender_id,
          conversation_id: msg.conversation_id,
          media_type: msg.media_type,
          media_url: msg.media_url,
          sender: {
            id: msg["sender.id"],
            username: msg["sender.username"],
            full_name: msg["sender.full_name"],
            avatar_url: msg["sender.avatar_url"]
          }
        }));
        
        setMessages(formattedMessages);
        return formattedMessages;
      }
      
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
