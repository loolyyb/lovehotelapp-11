
import React, { useEffect } from 'react';
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
  
  // Debug render counts and state
  useEffect(() => {
    console.log(`MessageViewLogic rendered for conversation: ${conversationId}`, {
      hasMessages: props.messages.length > 0,
      messageCount: props.messages.length,
      currentProfileId: props.currentProfileId,
      hasOtherUser: !!props.otherUser,
      isLoading: props.isLoading,
      isError: props.isError
    });
  }, [
    conversationId, 
    props.messages.length, 
    props.currentProfileId, 
    props.otherUser, 
    props.isLoading, 
    props.isError
  ]);
  
  // Simply pass all the props to the render function
  return <>{renderContent(props)}</>;
}
