
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useLogger } from "@/hooks/useLogger";
import { AlertService } from "@/services/AlertService";

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
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetchConversations = useCallback(async () => {
    // Use ref to prevent multiple simultaneous fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setError(null);
      logger.info("Fetching conversations", { timestamp: new Date().toISOString() });
      
      // Get current user
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          logger.error("No authenticated user found", { component: "useConversations" });
          setError("Vous devez être connecté pour accéder aux messages");
          setIsLoading(false);
          fetchingRef.current = false;
          return;
        }

        logger.info("User authenticated", { 
          userId: user.id,
          email: user.email,
          component: "useConversations" 
        });

        // Get user's profile id
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          logger.error("Error fetching user profile", { 
            error: profileError,
            userId: user.id,
            component: "useConversations" 
          });
          
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            logger.info("Retrying profile fetch", { 
              attempt: retryCountRef.current,
              component: "useConversations"
            });
            fetchingRef.current = false;
            setTimeout(fetchConversations, 1000);
            return;
          }
          
          setError("Erreur lors de la récupération du profil");
          setIsLoading(false);
          fetchingRef.current = false;
          return;
        }

        if (!userProfile) {
          logger.warn("No profile found for user", { 
            userId: user.id,
            component: "useConversations" 
          });
          setConversations([]);
          setIsLoading(false);
          fetchingRef.current = false;
          return;
        }

        logger.info("User profile found", { 
          profileId: userProfile.id,
          username: userProfile.username,
          fullName: userProfile.full_name,
          component: "useConversations" 
        });

        setCurrentProfileId(userProfile.id);
        
        // Récupération des conversations avec jointure des profils
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select(`
            *,
            user1:profiles!conversations_user1_id_fkey(id, username, full_name, avatar_url),
            user2:profiles!conversations_user2_id_fkey(id, username, full_name, avatar_url)
          `)
          .or(`user1_id.eq.${userProfile.id},user2_id.eq.${userProfile.id}`)
          .eq('status', 'active')
          .order('updated_at', { ascending: false });

        if (conversationsError) {
          logger.error("Error fetching conversations", {
            error: conversationsError.message,
            code: conversationsError.code,
            details: conversationsError.details,
            component: "useConversations"
          });
          throw conversationsError;
        }
        
        logger.info("Fetched conversations", { 
          count: conversationsData?.length || 0,
          component: "useConversations" 
        });
        
        // Filtre pour exclure les conversations avec soi-même
        const filteredData = conversationsData?.filter(conversation => 
          conversation.user1_id !== conversation.user2_id
        ) || [];
        
        logger.info("Filtered conversations before messages", { 
          count: filteredData.length,
          conversationIds: filteredData.map(c => c.id),
          component: "useConversations"
        });
        
        // Pour chaque conversation, récupérer le message le plus récent
        const conversationsWithMessages = await Promise.all(
          filteredData.map(async (conversation) => {
            try {
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
                  conversationId: conversation.id,
                  component: "useConversations"
                });
                return { ...conversation, messages: [] };
              }
              
              logger.info("Messages for conversation", {
                conversationId: conversation.id,
                count: messages?.length || 0,
                component: "useConversations"
              });
              
              return {
                ...conversation,
                messages: messages || []
              };
            } catch (error: any) {
              logger.error("Error fetching messages for conversation", {
                error: error.message,
                stack: error.stack,
                conversationId: conversation.id,
                component: "useConversations"
              });
              AlertService.captureException(error, {
                conversationId: conversation.id
              });
              return { ...conversation, messages: [] };
            }
          })
        );
        
        const conversationsWithMessagesCount = conversationsWithMessages.filter(c => c.messages?.length > 0).length;
        
        logger.info("Fetched conversations with messages", { 
          count: conversationsWithMessages.length,
          hasMessages: conversationsWithMessagesCount,
          timestamp: new Date().toISOString(),
          component: "useConversations"
        });
        
        // Reset retry counter on success
        retryCountRef.current = 0;
        setConversations(conversationsWithMessages);
      } catch (authError: any) {
        logger.error("Error authenticating user", {
          error: authError.message,
          stack: authError.stack,
          component: "useConversations"
        });
        AlertService.captureException(authError);
        setError("Erreur d'authentification");
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter pour accéder à vos messages",
        });
      }
    } catch (error: any) {
      logger.error("Error fetching conversations", { 
        error: error.message,
        stack: error.stack,
        component: "useConversations" 
      });
      AlertService.captureException(error);
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

  return { 
    conversations, 
    isLoading, 
    error, 
    refetch: fetchConversations, 
    currentProfileId 
  };
};
