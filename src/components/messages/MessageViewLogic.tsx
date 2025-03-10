
import React, { useEffect, useRef } from 'react';
import { useMessageViewProps } from './logic/useMessageViewProps';

interface MessageViewLogicProps {
  conversationId: string;
  renderContent: (props: any) => React.ReactNode;
}

export function MessageViewLogic({ 
  conversationId, 
  renderContent 
}: MessageViewLogicProps) {
  // Use the hook to get all the props needed for rendering
  const props = useMessageViewProps(conversationId);
  const renderCountRef = useRef(0);
  
  // Enhanced debug render counts and state
  useEffect(() => {
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
