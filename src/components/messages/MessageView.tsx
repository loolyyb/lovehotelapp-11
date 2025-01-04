import { useEffect, useRef, useState } from "react";
import { MessageHeader } from "./MessageHeader";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { useMessageHandlers } from "@/hooks/useMessageHandlers";
import { useMessageSubscription } from "@/hooks/useMessageSubscription";
import { useMessageRetrieval } from "@/hooks/useMessageRetrieval";
import { useConversationInit } from "@/hooks/useConversationInit";
import { useToast } from "@/hooks/use-toast";

interface MessageViewProps {
  conversationId: string;
  onBack: () => void;
}

export function MessageView({ conversationId, onBack }: MessageViewProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { sendMessage } = useMessageHandlers({ 
    currentUserId, 
    conversationId, 
    newMessage,
    setNewMessage, 
    toast 
  });

  const { subscribeToNewMessages } = useMessageSubscription({ 
    conversationId, 
    setMessages 
  });

  const { fetchMessages, markMessagesAsRead } = useMessageRetrieval({ 
    conversationId, 
    currentUserId, 
    setMessages, 
    toast 
  });

  const { getCurrentUser } = useConversationInit({
    conversationId,
    setMessages,
    setCurrentUserId,
    setOtherUser,
  });

  useEffect(() => {
    console.log("Initializing MessageView with conversationId:", conversationId);
    getCurrentUser();
  }, [conversationId]);

  useEffect(() => {
    if (currentUserId) {
      fetchMessages();
      subscribeToNewMessages();
    }
  }, [currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-cream">
      <MessageHeader 
        otherUser={otherUser} 
        onBack={onBack} 
        conversationId={conversationId}
      />

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

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSend={sendMessage}
        conversationId={conversationId}
      />
    </div>
  );
}