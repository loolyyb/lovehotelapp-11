
import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ChevronLeft } from "lucide-react";
import { useMessageSubscription } from "@/hooks/useMessageSubscription";
import { useMessageHandlers } from "@/hooks/useMessageHandlers";
import { useMessageRetrieval } from "@/hooks/useMessageRetrieval";
import { useConversationInit } from "@/hooks/useConversationInit";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "./LoadingState";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const firstLoad = useRef(true);
  const { toast } = useToast();

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
        await getCurrentUser();
        
        if (!mounted) return;
        
        if (currentProfileId) {
          await fetchMessages();
        }
      } catch (error) {
        console.error("Error initializing conversation:", error);
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

    const unsubscribe = subscribeToNewMessages();

    console.log("Setting up message subscription with profile ID:", currentProfileId);
    console.log("Current conversation ID:", conversationId);
    console.log("Current messages count:", messages.length);

    return () => {
      unsubscribe();
    };
  }, [currentProfileId, conversationId]);

  // Marquer les messages comme lus lorsqu'ils changent
  useEffect(() => {
    if (currentProfileId && messages.length > 0 && !isLoading) {
      console.log("Checking for unread messages after messages update");
      const hasUnreadMessages = messages.some(
        msg => msg.sender_id !== currentProfileId && !msg.read_at
      );
      
      if (hasUnreadMessages) {
        console.log("Found unread messages, marking as read");
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

  // Essayer à nouveau en cas d'erreur
  const retryLoad = async () => {
    setIsError(false);
    setIsLoading(true);
    try {
      await getCurrentUser();
      if (currentProfileId) {
        await fetchMessages();
      }
    } catch (error) {
      console.error("Error retrying load:", error);
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
