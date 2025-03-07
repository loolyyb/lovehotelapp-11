
import { useRef, useEffect, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyConversation } from "./EmptyConversation";
import { Button } from "../ui/button";
import { ChevronUp } from "lucide-react";

interface MessageContentProps {
  isLoading: boolean;
  isError: boolean;
  messages: any[];
  currentProfileId: string | null;
  retryLoad: () => void;
  loadMoreMessages?: () => void;
  isLoadingMore?: boolean;
  hasMoreMessages?: boolean;
}

export function MessageContent({ 
  isLoading,
  isError,
  messages,
  currentProfileId,
  retryLoad,
  loadMoreMessages,
  isLoadingMore = false,
  hasMoreMessages = false
}: MessageContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Track if user has scrolled up
  const handleScroll = () => {
    if (!messageContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    // Only change autoScroll if it's different from current value
    if (autoScroll !== isAtBottom) {
      setAutoScroll(isAtBottom);
    }
    
    // Check if we need to load more messages when scrolling to top
    if (scrollTop < 100 && hasMoreMessages && loadMoreMessages && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  // Automatic scroll to last message on new messages
  useEffect(() => {
    if (messages && messages.length > 0 && autoScroll) {
      const timeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [messages, autoScroll]);

  // Add enhanced logging to help debug
  useEffect(() => {
    console.log("MessageContent render state:", { 
      isLoading, 
      isError, 
      messagesCount: messages?.length || 0,
      currentProfileId,
      hasCurrentProfile: Boolean(currentProfileId),
      hasMoreMessages,
      isLoadingMore
    });
    
    if (messages?.length > 0) {
      console.log("First message:", messages[0]);
      console.log("Last message:", messages[messages.length - 1]);
      
      // Count messages by sender to help debug
      const messageBySender = {};
      messages.forEach(msg => {
        const senderId = msg.sender_id;
        if (!messageBySender[senderId]) {
          messageBySender[senderId] = 0;
        }
        messageBySender[senderId]++;
      });
      console.log("Messages by sender:", messageBySender);
      
      // Check if current user is a sender
      if (currentProfileId) {
        const currentUserMessages = messages.filter(m => m.sender_id === currentProfileId);
        console.log("Current user messages count:", currentUserMessages.length);
      }
    }
  }, [isLoading, isError, messages, currentProfileId, hasMoreMessages, isLoadingMore]);

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
    <div 
      className="flex flex-col space-y-1 p-4 overflow-y-auto h-full" 
      ref={messageContainerRef}
      onScroll={handleScroll}
    >
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <div className="animate-pulse text-[#f3ebad]/70">Chargement des messages...</div>
        </div>
      )}
      
      {hasMoreMessages && !isLoadingMore && (
        <div className="flex justify-center py-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadMoreMessages}
            className="text-[#f3ebad]/70 hover:text-[#f3ebad] hover:bg-[#f3ebad]/10 flex items-center"
          >
            <ChevronUp className="h-4 w-4 mr-1" />
            Charger plus de messages
          </Button>
        </div>
      )}
      
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isCurrentUser={message.sender_id === currentProfileId}
        />
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
