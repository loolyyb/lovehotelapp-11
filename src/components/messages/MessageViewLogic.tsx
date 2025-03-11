
import React, { useEffect, useRef, memo } from 'react';
import { useMessageViewProps } from './logic/useMessageViewProps';

interface MessageViewLogicProps {
  conversationId: string;
  renderContent: (props: {
    messages: any[];
    currentProfileId: string | null;
    otherUser: any;
    isLoading: boolean;
    isError: boolean;
    retryLoad: () => Promise<void>;
    refreshMessages: () => Promise<void>;
    isRefreshing: boolean;
    loadMoreMessages: () => Promise<void>;
    isLoadingMore: boolean;
    hasMoreMessages: boolean;
    newMessage: string;
    setNewMessage: (message: string) => void;
    sendMessage: (e?: React.FormEvent) => void;
    authStatus: string;
    profileInitialized: boolean;
  }) => React.ReactNode;
}

// Memoized component to prevent unnecessary renders
function MessageViewLogicComponent({ 
  conversationId, 
  renderContent 
}: MessageViewLogicProps) {
  // Use the hook to get all the props needed for rendering
  const props = useMessageViewProps(conversationId);
  const renderCountRef = useRef(0);
  
  // Enhanced debug render counts and state - only log in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      renderCountRef.current += 1;
      console.log(`MessageViewLogic rendered for conversation: ${conversationId} (render #${renderCountRef.current})`, {
        hasMessages: props.messages.length > 0,
        messageCount: props.messages.length,
        currentProfileId: props.currentProfileId,
        hasOtherUser: !!props.otherUser,
        isLoading: props.isLoading,
        isError: props.isError,
        authStatus: props.authStatus,
        profileInitialized: props.profileInitialized
      });
      
      // Additional auth check logging
      if (!props.currentProfileId) {
        console.warn('MessageViewLogic rendered without a profile ID', {
          conversationId,
          authStatus: props.authStatus
        });
      }
    }
  }, [
    conversationId, 
    props.messages.length, 
    props.currentProfileId, 
    props.otherUser, 
    props.isLoading, 
    props.isError,
    props.authStatus,
    props.profileInitialized
  ]);
  
  // Simply pass all the props to the render function
  return <>{renderContent(props)}</>;
}

// Export memoized component to prevent unnecessary re-renders
export const MessageViewLogic = memo(MessageViewLogicComponent);
