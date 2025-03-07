
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
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
  const prevMessagesLengthRef = useRef<number>(0);
  const prevLastMessageIdRef = useRef<string | null>(null);
  const isUserAtBottomRef = useRef<boolean>(true);
  const messagesRef = useRef<any[]>([]);
  const scrollPositionRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Update messagesRef when messages prop changes
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Memoize unique messages to prevent unnecessary re-renders
  const uniqueMessages = useMemo(() => {
    // Create a deduplicated messages array with stable rendering
    const result = messages.reduce((acc: any[], message) => {
      if (message.optimistic) {
        // For optimistic messages, check by content to avoid duplicates
        if (!acc.some(m => m.optimistic && m.content === message.content)) {
          acc.push(message);
        }
        return acc;
      }
      
      // For regular messages, check by ID
      if (!acc.some(m => m.id === message.id)) {
        acc.push(message);
      }
      return acc;
    }, []);
    
    return result;
  }, [messages]);

  // Save scroll position before updates
  const saveScrollPosition = useCallback(() => {
    if (messageContainerRef.current) {
      scrollPositionRef.current = messageContainerRef.current.scrollTop;
    }
  }, []);

  // Restore scroll position after updates
  const restoreScrollPosition = useCallback(() => {
    if (messageContainerRef.current && !autoScroll) {
      messageContainerRef.current.scrollTop = scrollPositionRef.current;
    }
  }, [autoScroll]);

  // Track if user has scrolled up with debouncing to prevent too many state updates
  const handleScroll = useCallback(() => {
    if (!messageContainerRef.current || isScrollingRef.current) return;
    
    isScrollingRef.current = true;
    saveScrollPosition();
    
    const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    // Update ref for use in useEffect
    isUserAtBottomRef.current = isAtBottom;
    
    // Only change autoScroll if it's different from current value
    if (autoScroll !== isAtBottom) {
      setAutoScroll(isAtBottom);
    }
    
    // Check if we need to load more messages when scrolling to top
    if (scrollTop < 100 && hasMoreMessages && loadMoreMessages && !isLoadingMore) {
      loadMoreMessages();
    }
    
    // Debounce scroll handling
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
      scrollTimeoutRef.current = null;
    }, 100) as unknown as number;
  }, [autoScroll, hasMoreMessages, isLoadingMore, loadMoreMessages, saveScrollPosition]);

  // Function to determine if there's a new message with memo for stability
  const hasNewMessage = useCallback(() => {
    if (!messages || !Array.isArray(messages) || messages.length === 0) return false;
    
    // Check for new message count
    const hasMoreMessages = messages.length > prevMessagesLengthRef.current;
    
    // Check for new message ID (different from last known message)
    const lastMessage = messages[messages.length - 1];
    const lastMessageId = lastMessage?.id || null;
    const isNewMessageId = lastMessageId && lastMessageId !== prevLastMessageIdRef.current;
    
    // Update refs for next comparison
    prevMessagesLengthRef.current = messages.length;
    if (lastMessageId) {
      prevLastMessageIdRef.current = lastMessageId;
    }
    
    return hasMoreMessages || isNewMessageId;
  }, [messages]);

  // Automatic scroll to last message on new messages - optimized
  useEffect(() => {
    if (!messages || !Array.isArray(messages)) return;
    
    const gotNewMessage = hasNewMessage();
    const userWantsAutoScroll = autoScroll || isUserAtBottomRef.current;
    
    if ((gotNewMessage && userWantsAutoScroll) && !isLoadingMore) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    } else if (!isLoadingMore) {
      // If not scrolling to bottom, maintain scroll position
      restoreScrollPosition();
    }
  }, [uniqueMessages, autoScroll, isLoadingMore, hasNewMessage, restoreScrollPosition]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading && (!messages || messages.length === 0)) {
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
      
      {uniqueMessages.map((message) => (
        <MessageBubble
          key={message.id || `temp-${message.created_at}`}
          message={message}
          isCurrentUser={message.sender_id === currentProfileId}
        />
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
