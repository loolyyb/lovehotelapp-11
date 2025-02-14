
import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ChevronLeft } from "lucide-react";
import { useMessageSubscription } from "@/hooks/useMessageSubscription";
import { useMessageHandlers } from "./hooks/useMessageHandlers";
import { useMessageRetrieval } from "./hooks/useMessageRetrieval";
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
  const { toast } = useToast();

  const { getCurrentUser } = useConversationInit({
    conversationId,
    setMessages,
    setCurrentUserId,
    setOtherUser,
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
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchMessages();
      const unsubscribe = subscribeToNewMessages();
      return () => {
        unsubscribe();
      };
    }
  }, [currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return <LoadingState />;
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
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-[#f3ebad]">
            {otherUser?.username || otherUser?.full_name || 'Chat'}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isCurrentUser={message.sender_id === currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[#f3ebad]/30 hover:shadow-lg transition-all duration-300">
        <MessageInput
          value={newMessage}
          onChange={setNewMessage}
          onSubmit={sendMessage}
        />
      </div>
    </div>
  );
}
