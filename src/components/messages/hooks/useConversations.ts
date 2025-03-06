
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
  const debounceTimerRef = useRef<number | null>(null);
  const channelRef = useRef<any>(null);

  const fetchConversations = useCallback(async () => {
    // Use ref to prevent multiple simultaneous fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setError(null);
      logger.info("Fetching conversations", { timestamp: new Date().toISOString() });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Vous devez être connecté pour accéder aux messages");
        setIsLoading(false);
        fetchingRef.current = false;
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
        setIsLoading(false);
        fetchingRef.current = false;
        return;
      }

      setCurrentProfileId(userProfile.id);
      
      // First fetch conversations with basic details
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!conversations_user1_profile_fkey(*),
          user2:profiles!conversations_user2_profile_fkey(*)
        `)
        .or(`user1_id.eq.${userProfile.id},user2_id.eq.${userProfile.id}`)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Filter out self-conversations
      const filteredData = data?.filter(conversation => 
        conversation.user1_id !== conversation.user2_id
      ) || [];
      
      // For each conversation, fetch the most recent message separately
      const conversationsWithMessages = await Promise.all(
        filteredData.map(async (conversation) => {
          const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              created_at,
              sender_id,
              read_at
            `)
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (messagesError) {
            logger.error("Error fetching messages for conversation", {
              error: messagesError,
              conversationId: conversation.id
            });
            return { ...conversation, messages: [] };
          }
          
          return {
            ...conversation,
            messages: messages || []
          };
        })
      );
      
      logger.info("Fetched conversations", { 
        count: conversationsWithMessages.length,
        timestamp: new Date().toISOString() 
      });
      
      setConversations(conversationsWithMessages);
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

  // Set up direct subscription for conversation updates
  useEffect(() => {
    if (!currentProfileId) return;
    
    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channelId = `conversations-updates-${currentProfileId}-${Date.now()}`;
    logger.info(`Setting up conversation realtime subscription: ${channelId}`);
    
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'conversations',
          filter: `user1_id=eq.${currentProfileId}`, 
        },
        (payload) => {
          // Ensure payload.new is defined and has an id
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            logger.info("Conversation change detected", { 
              event: payload.eventType,
              conversationId: payload.new.id,
              timestamp: new Date().toISOString()
            });
            fetchConversations();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'conversations',
          filter: `user2_id=eq.${currentProfileId}`, 
        },
        (payload) => {
          // Ensure payload.new is defined and has an id
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            logger.info("Conversation change detected", { 
              event: payload.eventType,
              conversationId: payload.new.id,
              timestamp: new Date().toISOString()
            });
            fetchConversations();
          }
        }
      )
      .subscribe((status) => {
        logger.info("Conversation subscription status", { status, channelId });
      });
      
    channelRef.current = channel;
    
    return () => {
      logger.info(`Removing conversation subscription: ${channelId}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentProfileId, logger, fetchConversations]);

  // Handler for new messages with debounce to prevent excessive updates
  const handleNewMessage = useCallback((message) => {
    logger.info("New message received, triggering conversation update", { 
      messageId: message.id, 
      conversationId: message.conversation_id,
      timestamp: new Date().toISOString()
    });
    
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    // Set a new debounce timer to fetch conversations
    debounceTimerRef.current = window.setTimeout(() => {
      fetchConversations();
      debounceTimerRef.current = null;
    }, 300);
  }, [fetchConversations, logger]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Setup realtime subscription for messages
  useRealtimeMessages({
    currentProfileId,
    onNewMessage: handleNewMessage,
  });

  return { conversations, isLoading, error, refetch: fetchConversations, currentProfileId };
};
