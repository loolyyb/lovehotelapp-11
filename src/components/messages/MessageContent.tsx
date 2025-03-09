
import React, { useRef, useEffect, useState, useCallback } from "react";
import { MessageGroup } from "./MessageGroup";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import { DateSeparator } from "./DateSeparator";
import { format } from "date-fns";

interface MessageContentProps {
  messages: any[];
  currentProfileId: string | null;
  loadMoreMessages: () => void;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  isLoading?: boolean;
  isError?: boolean;
  retryLoad?: () => void;
}

export function MessageContent({
  messages,
  currentProfileId,
  loadMoreMessages,
  isLoadingMore,
  hasMoreMessages,
  isLoading = false,
  isError = false,
  retryLoad
}: MessageContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [scrollCount, setScrollCount] = useState(0);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);
  
  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, []);

  // Check if we need to scroll based on message changes
  useEffect(() => {
    // If messages count increased - we got new messages
    if (messages.length > prevMessagesLength) {
      // Check if last message is from current user
      const lastMessage = messages[messages.length - 1];
      const isFromCurrentUser = lastMessage && lastMessage.sender_id === currentProfileId;
      
      // Always auto-scroll on new messages from current user
      if (isFromCurrentUser) {
        scrollToBottom();
      } else {
        // For other users' messages, only auto-scroll if near bottom
        const container = containerRef.current;
        if (container) {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
          
          if (isNearBottom) {
            scrollToBottom();
          } else {
            setShowScrollButton(true);
          }
        }
      }
    }
    
    // Save current length for future comparison
    setPrevMessagesLength(messages.length);
  }, [messages.length, currentProfileId, scrollToBottom, prevMessagesLength]);

  // Initial scroll when component mounts
  useEffect(() => {
    scrollToBottom('auto');
  }, [scrollToBottom]);

  // Track scroll position to show/hide scroll button
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    setShowScrollButton(!isNearBottom);
  }, []);

  // Group messages by date and sender
  const groupedContent = React.useMemo(() => {
    const result: {
      type: 'date' | 'messages';
      date?: Date;
      senderId?: string | null;
      messages?: any[];
      key: string;
    }[] = [];
    
    let currentDate: string | null = null;
    let currentGroup: any[] = [];
    let currentSenderId: string | null = null;
    
    messages.forEach((message, index) => {
      const messageDate = new Date(message.created_at);
      const messageDateStr = format(messageDate, 'yyyy-MM-dd');
      
      // If the date has changed, add a new date separator
      if (messageDateStr !== currentDate) {
        // First, finish the current message group if it exists
        if (currentGroup.length > 0) {
          result.push({
            type: 'messages',
            senderId: currentSenderId,
            messages: [...currentGroup],
            key: `group-${currentSenderId}-${index}`
          });
          currentGroup = [];
        }
        
        // Add the date separator
        result.push({
          type: 'date',
          date: messageDate,
          key: `date-${messageDateStr}`
        });
        
        currentDate = messageDateStr;
        currentSenderId = message.sender_id;
        currentGroup = [message];
      } 
      // If only the sender has changed
      else if (message.sender_id !== currentSenderId) {
        if (currentGroup.length > 0) {
          result.push({
            type: 'messages',
            senderId: currentSenderId,
            messages: [...currentGroup],
            key: `group-${currentSenderId}-${index}`
          });
        }
        currentGroup = [message];
        currentSenderId = message.sender_id;
      } 
      // Same date and same sender, just add to current group
      else {
        currentGroup.push(message);
      }
    });
    
    // Add the last group if it exists
    if (currentGroup.length > 0) {
      result.push({
        type: 'messages',
        senderId: currentSenderId,
        messages: currentGroup,
        key: `group-${currentSenderId}-${messages.length}`
      });
    }
    
    return result;
  }, [messages]);

  // Track scroll count to reattach scroll listeners
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, scrollCount]);

  // Increment scroll count to force reattach of listeners
  useEffect(() => {
    setScrollCount(prev => prev + 1);
  }, [messages.length]);

  return (
    <div 
      ref={containerRef} 
      className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#f3ebad]/20 scrollbar-track-transparent"
    >
      {hasMoreMessages && (
        <div className="flex justify-center py-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadMoreMessages}
            disabled={isLoadingMore}
            className="text-[#f3ebad]/70 hover:text-[#f3ebad] border-[#f3ebad]/30"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              "Charger plus de messages"
            )}
          </Button>
        </div>
      )}

      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 text-[#f3ebad]/50 animate-spin" />
        </div>
      )}
      
      {groupedContent.map((item) => (
        <React.Fragment key={item.key}>
          {item.type === 'date' && item.date && (
            <DateSeparator date={item.date} />
          )}
          {item.type === 'messages' && item.messages && (
            <MessageGroup 
              messages={item.messages}
              isCurrentUser={item.senderId === currentProfileId}
            />
          )}
        </React.Fragment>
      ))}
      
      {/* Element to scroll to */}
      <div ref={messagesEndRef} />
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          className="fixed bottom-20 right-6 rounded-full w-10 h-10 p-0 bg-[#f3ebad] hover:bg-[#f3ebad]/90 text-burgundy shadow-lg"
          onClick={() => scrollToBottom()}
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
