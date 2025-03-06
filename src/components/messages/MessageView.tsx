
import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ChevronLeft, RefreshCw } from "lucide-react";
import { useMessageSubscription } from "@/hooks/useMessageSubscription";
import { useMessageHandlers } from "@/hooks/useMessageHandlers";
import { useMessageRetrieval } from "@/hooks/useMessageRetrieval";
import { useConversationInit } from "@/hooks/useConversationInit";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "./LoadingState";
import { useLogger } from "@/hooks/useLogger";

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
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const firstLoad = useRef(true);
  const { toast } = useToast();
  const logger = useLogger("MessageView");

  const { getCurrentUser } = useConversationInit({
    conversationId,
    setMessages,
    setCurrentProfileId,
    setOtherUser,
    setIsLoading,
  });

  const { subscribeToNewMessages } = useMessageSubscription({
    conversationId,
    setMessages,
  });

  const { fetchMessages, markMessagesAsRead } = useMessageRetrieval({
    conversationId,
    currentProfileId,
    setMessages,
    toast,
  });

  const { sendMessage } = useMessageHandlers({
    currentProfileId,
    conversationId,
    newMessage,
    setNewMessage,
    toast,
  });

  // Initialisation et chargement des messages
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
        } else {
          logger.warn("No current profile ID after getCurrentUser", { conversationId });
        }
      } catch (error: any) {
        logger.error("Error initializing conversation", { 
          error: error.message,
          stack: error.stack,
          conversationId 
        });
        if (mounted) {
          setIsError(true);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de charger la conversation"
          });
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

  // Gestion des abonnements en temps réel
  useEffect(() => {
    if (!currentProfileId || !conversationId) return;

    logger.info("Setting up message subscription", { 
      profileId: currentProfileId,
      conversationId
    });
    
    const unsubscribe = subscribeToNewMessages();

    return () => {
      unsubscribe();
    };
  }, [currentProfileId, conversationId]);

  // Marquer les messages comme lus lorsqu'ils changent
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

  // Défilement automatique vers le dernier message
  useEffect(() => {
    if (messages.length > 0) {
      const timeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [messages]);

  // Fonction pour rafraîchir manuellement les messages
  const refreshMessages = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setIsError(false);
    
    try {
      logger.info("Manually refreshing messages", { conversationId });
      await fetchMessages();
    } catch (error: any) {
      logger.error("Error refreshing messages", { 
        error: error.message,
        stack: error.stack,
        conversationId 
      });
      setIsError(true);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de rafraîchir les messages"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Essayer à nouveau en cas d'erreur
  const retryLoad = async () => {
    setIsError(false);
    setIsLoading(true);
    
    try {
      logger.info("Retrying conversation load", { conversationId });
      await getCurrentUser();
      
      if (currentProfileId) {
        logger.info("Retrying message fetch", { 
          profileId: currentProfileId,
          conversationId 
        });
        await fetchMessages();
      } else {
        logger.warn("No profile ID when retrying load", { conversationId });
      }
    } catch (error: any) {
      logger.error("Error retrying load", { 
        error: error.message,
        stack: error.stack,
        conversationId 
      });
      setIsError(true);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger la conversation"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#40192C] backdrop-blur-sm border-[0.5px] border-[#f3ebad]/30">
      <div className="p-4 border-b border-[#f3ebad]/30 flex items-center hover:shadow-lg transition-all duration-300">
        <button 
          onClick={onBack}
          className="md:hidden mr-2 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-[#f3ebad]" />
        </button>
        {otherUser && (
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#f3ebad]">
              {otherUser?.username || otherUser?.full_name || 'Chat'}
            </h2>
          </div>
        )}
        <button 
          onClick={refreshMessages}
          disabled={isRefreshing}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Rafraîchir les messages"
        >
          <RefreshCw className={`w-5 h-5 text-[#f3ebad] ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && !messages.length ? (
          <LoadingState />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-[#f3ebad]/70 mb-4">Impossible de charger les messages</p>
            <button 
              onClick={retryLoad} 
              className="px-4 py-2 bg-[#f3ebad]/20 text-[#f3ebad] rounded-md hover:bg-[#f3ebad]/30 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-[#f3ebad]/70">Aucun message dans cette conversation</p>
            <p className="text-[#f3ebad]/50 text-sm mt-2">Commencez à écrire pour envoyer un message</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={message.sender_id === currentProfileId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
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
