
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { MessageHeader } from "./MessageHeader";
import { MessageContent } from "./MessageContent";
import { MessageInput } from "./MessageInput";
import { useMessageHandlers } from "@/hooks/useMessageHandlers";
import { useMessageRetrieval } from "@/hooks/messages/useMessageRetrieval";
import { useConversationInit } from "@/hooks/useConversationInit";
import { useMessageRefresh } from "@/hooks/useMessageRefresh";
import { useLogger } from "@/hooks/useLogger";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { EmptyState } from "./EmptyState";
import { supabase } from "@/integrations/supabase/client";

interface MessageViewProps {
  conversationId: string;
  onBack: () => void;
}

export function MessageView({ conversationId, onBack }: MessageViewProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profileInitialized, setProfileInitialized] = useState(false);
  const firstLoad = useRef(true);
  const logger = useLogger("MessageView");
  const { toast } = useToast();

  const { getCurrentUser } = useConversationInit({
    conversationId,
    setMessages,
    setCurrentProfileId: useCallback((profileId: string | null) => {
      setCurrentProfileId(profileId);
      if (profileId) {
        setProfileInitialized(true);
      }
    }, []),
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
          logger.error("No active session", { component: "MessageView" });
          toast({
            variant: "destructive",
            title: "Session expirée",
            description: "Veuillez vous reconnecter pour accéder à vos messages"
          });
          return;
        }

        logger.info("Auth session valid, initializing conversation", { 
          userId: session.user.id,
          conversationId 
        });
        
        if (mounted) {
          await getCurrentUser();
        }
      } catch (error: any) {
        logger.error("Error checking authentication", { 
          error: error.message,
          stack: error.stack
        });
        
        if (mounted) {
          setIsError(true);
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
      if (!currentProfileId || !profileInitialized) {
        return;
      }
      
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
        }
      }
    };
    
    loadMessages();
    
    return () => {
      mounted = false;
    };
  }, [currentProfileId, profileInitialized, conversationId, fetchMessages, logger]);

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
  }, [messages, currentProfileId, isLoading, markMessagesAsRead, logger]);

  return (
    <div className="flex flex-col h-full bg-[#40192C] backdrop-blur-sm border-[0.5px] border-[#f3ebad]/30">
      <MessageHeader 
        onBack={onBack} 
        refreshMessages={handleRefresh} 
        isRefreshing={isRefreshing}
        otherUser={otherUser}
      />

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-[#f3ebad]/70">Chargement des messages...</div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full text-[#f3ebad]/70">
            <p className="mb-4">Impossible de charger les messages</p>
            <button 
              onClick={retryLoad} 
              className="px-4 py-2 bg-[#f3ebad]/20 text-[#f3ebad] rounded-md hover:bg-[#f3ebad]/30 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : messages.length === 0 ? (
          <EmptyState onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        ) : (
          <MessageContent 
            isLoading={isLoading}
            isError={isError}
            messages={messages}
            currentProfileId={currentProfileId}
            retryLoad={retryLoad}
            loadMoreMessages={loadMoreMessages}
            isLoadingMore={isLoadingMore || isFetchingMore}
            hasMoreMessages={hasMoreMessages}
          />
        )}
      </div>

      <div className="p-4 border-t border-[#f3ebad]/30 hover:shadow-lg transition-all duration-300">
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSend={sendMessage}
          disabled={isLoading || isError || !currentProfileId}
        />
      </div>
    </div>
  );
}
