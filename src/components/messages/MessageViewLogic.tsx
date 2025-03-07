import React, { useState, useEffect, useRef } from "react";
import { useLogger } from "@/hooks/useLogger";
import { useToast } from "@/hooks/use-toast";
import { useMessageRetrieval } from "@/hooks/messages/useMessageRetrieval";
import { useConversationInit } from "@/hooks/useConversationInit";
import { useMessageRefresh } from "@/hooks/useMessageRefresh";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useMessageHandlers } from "@/hooks/useMessageHandlers";
import { supabase } from "@/integrations/supabase/client";

interface MessageViewLogicProps {
  conversationId: string;
  renderContent: (props: {
    messages: any[];
    currentProfileId: string | null;
    otherUser: any;
    isLoading: boolean;
    isError: boolean;
    retryLoad: () => void;
    refreshMessages: () => void;
    isRefreshing: boolean;
    loadMoreMessages: () => void;
    isLoadingMore: boolean;
    hasMoreMessages: boolean;
    newMessage: string;
    setNewMessage: (message: string) => void;
    sendMessage: (e: React.FormEvent) => void;
  }) => React.ReactNode;
}

export function MessageViewLogic({ conversationId, renderContent }: MessageViewLogicProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [isFetchingInitialMessages, setIsFetchingInitialMessages] = useState(false);
  const firstLoad = useRef(true);
  const logger = useLogger("MessageViewLogic");
  const { toast } = useToast();

  const { getCurrentUser } = useConversationInit({
    conversationId,
    setMessages,
    setCurrentProfileId: (profileId: string | null) => {
      setCurrentProfileId(profileId);
      if (profileId) {
        setProfileInitialized(true);
      }
    },
    setOtherUser,
    setIsLoading,
  });

  const { 
    fetchMessages, 
    loadMoreMessages, 
    markMessagesAsRead, 
    addMessageToCache,
    isLoadingMore,
    hasMoreMessages,
    isFetchingMore
  } = useMessageRetrieval({
    conversationId,
    currentProfileId,
    setMessages,
    toast,
  });

  const { 
    isRefreshing, 
    isError, 
    isLoading: refreshLoading, 
    setIsError, 
    setIsLoading: setRefreshLoading, 
    refreshMessages, 
    retryLoad 
  } = useMessageRefresh({
    conversationId,
    fetchMessages,
    getCurrentUser,
    currentProfileId,
  });

  const { sendMessage } = useMessageHandlers({
    currentProfileId,
    conversationId,
    newMessage,
    setNewMessage,
    toast,
  });

  useRealtimeMessages({
    currentProfileId,
    onNewMessage: (message) => {
      if (message.conversation_id === conversationId) {
        logger.info("New message received, updating messages list", { messageId: message.id });
        // Use optimistic update via cache
        addMessageToCache(message);
      }
    },
    onMessageUpdate: (message) => {
      if (message.conversation_id === conversationId) {
        logger.info("Message updated, updating messages list", { messageId: message.id });
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? message : msg
        ));
      }
    }
  });

  const handleRefresh = async () => {
    logger.info("Manually refreshing messages", { conversationId });
    await refreshMessages();
  };

  // Initial profile and auth check - only runs once
  useEffect(() => {
    let mounted = true;
    setIsError(false);
    
    const checkAuth = async () => {
      try {
        // Check auth session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          logger.error("No active session", { component: "MessageViewLogic" });
          if (mounted) {
            setIsAuthChecked(true);
            setIsLoading(false);
            toast({
              variant: "destructive",
              title: "Session expirée",
              description: "Veuillez vous reconnecter pour accéder à vos messages"
            });
          }
          return;
        }

        logger.info("Auth session valid, initializing conversation", { 
          userId: session.user.id,
          conversationId 
        });
        
        if (mounted) {
          await getCurrentUser();
          setIsAuthChecked(true);
        }
      } catch (error: any) {
        logger.error("Error checking authentication", { 
          error: error.message,
          stack: error.stack
        });
        
        if (mounted) {
          setIsAuthChecked(true);
          setIsError(true);
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Erreur d'authentification",
            description: "Impossible de vérifier votre identité. Veuillez vous reconnecter."
          });
        }
      } finally {
        if (mounted) {
          firstLoad.current = false;
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [conversationId]); // Only depend on conversationId

  // Fetch messages when profile is initialized
  useEffect(() => {
    let mounted = true;
    
    const loadMessages = async () => {
      if (!currentProfileId || !profileInitialized || !isAuthChecked || isFetchingInitialMessages) {
        return;
      }
      
      setIsFetchingInitialMessages(true);
      logger.info("Profile initialized, fetching messages", { 
        profileId: currentProfileId,
        conversationId 
      });
      
      try {
        await fetchMessages();
      } catch (error: any) {
        logger.error("Error fetching messages", { 
          error: error.message,
          stack: error.stack
        });
        
        if (mounted) {
          setIsError(true);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsFetchingInitialMessages(false);
        }
      }
    };
    
    loadMessages();
    
    return () => {
      mounted = false;
    };
  }, [currentProfileId, profileInitialized, isAuthChecked, conversationId]);

  // Handle marking messages as read
  useEffect(() => {
    if (currentProfileId && messages.length > 0 && !isLoading) {
      logger.info("Checking for unread messages after update", {
        messagesCount: messages.length,
        profileId: currentProfileId
      });
      
      const hasUnreadMessages = messages.some(
        msg => msg.sender_id !== currentProfileId && !msg.read_at
      );
      
      if (hasUnreadMessages) {
        logger.info("Found unread messages, marking as read", {
          profileId: currentProfileId
        });
        setTimeout(() => markMessagesAsRead(), 500);
      }
    }
  }, [messages, currentProfileId, isLoading, markMessagesAsRead]);

  // Debug state changes
  useEffect(() => {
    logger.info("MessageViewLogic state update", {
      isLoading,
      isAuthChecked,
      profileInitialized,
      isFetchingInitialMessages,
      messagesCount: messages.length,
      hasCurrentProfile: !!currentProfileId
    });
  }, [isLoading, isAuthChecked, profileInitialized, isFetchingInitialMessages, messages.length, currentProfileId]);

  // Combined loading state 
  const showLoader = isLoading && (!messages.length || !isAuthChecked || !profileInitialized || isFetchingInitialMessages);

  return renderContent({
    messages,
    currentProfileId,
    otherUser,
    isLoading: showLoader,
    isError,
    retryLoad,
    refreshMessages: handleRefresh,
    isRefreshing,
    loadMoreMessages,
    isLoadingMore: isLoadingMore || isFetchingMore,
    hasMoreMessages,
    newMessage,
    setNewMessage,
    sendMessage
  });
}
