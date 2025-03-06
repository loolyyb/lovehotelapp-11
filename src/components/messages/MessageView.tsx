import { useState, useEffect, useRef } from "react";
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
  const firstLoad = useRef(true);
  const logger = useLogger("MessageView");
  const { toast } = useToast();

  const { getCurrentUser } = useConversationInit({
    conversationId,
    setMessages,
    setCurrentProfileId,
    setOtherUser,
    setIsLoading,
  });

  const { fetchMessages, markMessagesAsRead } = useMessageRetrieval({
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
        setMessages(prev => [...prev, message]);
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

  useEffect(() => {
    let mounted = true;
    setIsError(false);
    
    const initConversation = async () => {
      if (!firstLoad.current) {
        setIsLoading(true);
      }
      
      try {
        logger.info("Initializing conversation", { conversationId });
        await getCurrentUser();
        
        if (!mounted) return;
        
        if (currentProfileId) {
          logger.info("Current profile retrieved, fetching messages", { 
            profileId: currentProfileId,
            conversationId 
          });
          await fetchMessages();
        }
      } catch (error: any) {
        logger.error("Error initializing conversation", { 
          error: error.message,
          stack: error.stack,
          conversationId 
        });
        if (mounted) {
          setIsError(true);
        }
      } finally {
        if (mounted) {
          firstLoad.current = false;
          setIsLoading(false);
        }
      }
    };

    initConversation();

    return () => {
      mounted = false;
    };
  }, [conversationId, currentProfileId]);

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
  }, [messages, currentProfileId, isLoading]);

  return (
    <div className="flex flex-col h-full bg-[#40192C] backdrop-blur-sm border-[0.5px] border-[#f3ebad]/30">
      <MessageHeader 
        onBack={onBack} 
        refreshMessages={handleRefresh} 
        isRefreshing={isRefreshing}
        otherUser={otherUser}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : isError ? (
          <div>Error loading messages</div>
        ) : messages.length === 0 ? (
          <EmptyState onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        ) : (
          <MessageContent 
            isLoading={isLoading}
            isError={isError}
            messages={messages}
            currentProfileId={currentProfileId}
            retryLoad={retryLoad}
          />
        )}
      </div>

      <div className="p-4 border-t border-[#f3ebad]/30 hover:shadow-lg transition-all duration-300">
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
}
