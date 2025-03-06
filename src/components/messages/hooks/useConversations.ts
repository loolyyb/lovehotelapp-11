
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useLogger } from "@/hooks/useLogger";

export const useConversations = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const { toast } = useToast();
  const logger = useLogger("useConversations");
  const fetchingRef = useRef(false);

  const fetchConversations = useCallback(async () => {
    // Use ref to prevent multiple simultaneous fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Vous devez être connecté pour accéder aux messages");
        return;
      }

      // Get user's profile id
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userProfile) {
        setConversations([]);
        return;
      }

      setCurrentProfileId(userProfile.id);
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!conversations_user1_profile_fkey(*),
          user2:profiles!conversations_user2_profile_fkey(*),
          messages(
            id,
            content,
            created_at,
            sender_id,
            read_at
          )
        `)
        .or(`user1_id.eq.${userProfile.id},user2_id.eq.${userProfile.id}`)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      const filteredData = data?.filter(conversation => 
        conversation.user1_id !== conversation.user2_id
      ) || [];
      
      logger.info("Fetched conversations", { count: filteredData.length });
      setConversations(filteredData);
    } catch (error: any) {
      logger.error("Error fetching conversations", { 
        error: error.message,
        stack: error.stack,
        conversationId: null 
      });
      setError("Impossible de charger les conversations");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les conversations",
      });
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [toast, logger]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handler for new messages - debounced to prevent excessive updates
  const handleNewMessage = useCallback((message) => {
    logger.info("New message received, updating conversations", { messageId: message.id, conversationId: message.conversation_id });
    fetchConversations();
  }, [fetchConversations, logger]);

  // Handler for updated messages - debounced to prevent excessive updates
  const handleMessageUpdate = useCallback((message) => {
    logger.info("Message updated, updating conversations", { messageId: message.id, conversationId: message.conversation_id });
    fetchConversations();
  }, [fetchConversations, logger]);

  // Setup realtime subscription for messages
  useRealtimeMessages({
    currentProfileId,
    onNewMessage: handleNewMessage,
    onMessageUpdate: handleMessageUpdate
  });

  return { conversations, isLoading, error, refetch: fetchConversations };
};
