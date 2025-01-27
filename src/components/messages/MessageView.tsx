import { useRef, useEffect } from "react";
import { MessageHeader } from "./MessageHeader";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { supabase } from "@/integrations/supabase/client";
import { useMessageHandlers } from "./hooks/useMessageHandlers";
import { useMessageRetrieval } from "./hooks/useMessageRetrieval";
import { useConversationDetails } from "./hooks/useConversationDetails";
import { ChevronLeft } from "lucide-react";

interface MessageViewProps {
  conversationId: string;
  onBack: () => void;
}

export function MessageView({ conversationId, onBack }: MessageViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { otherUser, currentUserId } = useConversationDetails(conversationId);
  const { messages, setMessages, isLoading } = useMessageRetrieval(conversationId, currentUserId);
  const { newMessage, setNewMessage, sendMessage } = useMessageHandlers(conversationId, currentUserId);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log("New message received:", payload);
          setMessages(current => [...current, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-cream">
        <div className="text-burgundy">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-cream fixed top-16 left-0 right-0 bottom-16 md:relative md:top-0">
      <div className="flex items-center gap-2 p-4 border-b border-rose/20 bg-white">
        <button 
          onClick={onBack}
          className="md:hidden flex items-center text-burgundy hover:text-rose transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Retour</span>
        </button>
        <MessageHeader 
          otherUser={otherUser} 
          onBack={onBack} 
          conversationId={conversationId}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 md:pb-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isCurrentUser={message.sender_id === currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-16 left-0 right-0 md:relative md:bottom-0">
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSend={sendMessage}
          conversationId={conversationId}
        />
      </div>
    </div>
  );
}