
import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyConversation } from "./EmptyConversation";

interface MessageContentProps {
  isLoading: boolean;
  isError: boolean;
  messages: any[];
  currentProfileId: string | null;
  retryLoad: () => void;
}

export function MessageContent({ 
  isLoading,
  isError,
  messages,
  currentProfileId,
  retryLoad
}: MessageContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatic scroll to last message
  useEffect(() => {
    if (messages && messages.length > 0) {
      const timeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [messages]);

  // Add logging to help debug
  useEffect(() => {
    console.log("MessageContent state:", { 
      isLoading, 
      isError, 
      messagesCount: messages?.length || 0,
      currentProfileId
    });
  }, [isLoading, isError, messages, currentProfileId]);

  if (isLoading && !messages?.length) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState retryLoad={retryLoad} />;
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return <EmptyConversation />;
  }

  return (
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
  );
}
