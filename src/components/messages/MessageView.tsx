
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

  useEffect(() => {
    let mounted = true;
    
    const initConversation = async () => {
      if (!firstLoad.current) {
        setIsLoading(true);
      }
      await getCurrentUser();
      
      if (!mounted) return;
      
      if (currentProfileId) {
        await fetchMessages();
      }
      firstLoad.current = false;
    };

    initConversation();

    return () => {
      mounted = false;
    };
  }, [conversationId]);

  useEffect(() => {
    if (!currentProfileId) return;

    const unsubscribe = subscribeToNewMessages();

    // Ajout de logs de débuggage
    console.log("Setting up message subscription with profile ID:", currentProfileId);
    console.log("Current conversation ID:", conversationId);
    console.log("Current messages count:", messages.length);

    // Marquer les messages comme lus lorsque la conversation est ouverte
    // ET chaque fois qu'un nouveau message est reçu
    if (messages.length > 0) {
      console.log("Calling markMessagesAsRead from subscription effect");
      markMessagesAsRead();
    }

    return () => {
      unsubscribe();
    };
  }, [currentProfileId, conversationId, messages.length]);

  // Ajouter un nouvel useEffect pour garantir que les messages sont marqués comme lus
  // lors d'un changement dans la liste des messages
  useEffect(() => {
    if (currentProfileId && messages.length > 0 && !isLoading) {
      console.log("Messages changed, checking for unread messages...");
      const hasUnreadMessages = messages.some(
        msg => msg.sender_id !== currentProfileId && !msg.read_at
      );
      
      if (hasUnreadMessages) {
        console.log("Found unread messages, marking as read");
        setTimeout(() => markMessagesAsRead(), 500);
      }
    }
  }, [messages, currentProfileId, isLoading]);

  useEffect(() => {
    if (messages.length > 0) {
      const timeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [messages]);

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
