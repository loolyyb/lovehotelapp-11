
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const firstLoad = useRef(true);
  const { toast } = useToast();

  const { getCurrentUser } = useConversationInit({
    conversationId,
    setMessages,
    setCurrentUserId,
    setOtherUser,
    setIsLoading,
  });

  const { subscribeToNewMessages } = useMessageSubscription({
    conversationId,
    setMessages,
  });

  const { fetchMessages, markMessagesAsRead } = useMessageRetrieval({
    conversationId,
    currentUserId,
    setMessages,
    toast,
  });

  const { sendMessage } = useMessageHandlers({
    currentUserId,
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
      
      if (currentUserId) {
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
    if (!currentUserId) return;

    const unsubscribe = subscribeToNewMessages();

    // Mark messages as read when the conversation is opened
    if (messages.length > 0) {
      markMessagesAsRead();
    }

    return () => {
      unsubscribe();
    };
  }, [currentUserId, conversationId, messages.length]);

  useEffect(() => {
    if (messages.length > 0) {
      const timeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [messages]);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#f3ebad]/70">
        <p>Sélectionnez une conversation pour commencer</p>
      </div>
    );
  }

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
                isCurrentUser={message.sender_id === currentUserId}
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
