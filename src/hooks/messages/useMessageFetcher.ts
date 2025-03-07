
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

      // Check if user is authenticated and get their role
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

      // Get user profile to check role
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        logger.error("Error fetching user profile", { 
          error: profileError, 
          component: "useMessageFetcher" 
        });
        toast({
          variant: "destructive",
          title: "Erreur de profil",
          description: "Impossible de récupérer votre profil",
        });
        return null;
      }

      const isAdmin = userProfile?.role === 'admin';
      const canAccessConversation = (isAdmin || userProfile?.id === currentProfileId);
      
      if (!canAccessConversation) {
        logger.warn("User has no permission to access this conversation", {
          requestedProfileId: currentProfileId,
          userProfileId: userProfile?.id,
          component: "useMessageFetcher"
        });
      }
      
      logger.info("User authenticated, checking conversation access", { 
        authUserId: user.id,
        profileId: currentProfileId,
        isAdmin,
        component: "useMessageFetcher"
      });

      // Fetch messages - RLS policies will handle access control
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
