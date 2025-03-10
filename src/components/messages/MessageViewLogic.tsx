
import React, { useEffect } from 'react';
import { useMessageViewProps } from './logic/useMessageViewProps';
import { useLogger } from '@/hooks/useLogger';

interface MessageViewLogicProps {
  conversationId: string;
  renderContent: (props: any) => React.ReactNode;
}

export function MessageViewLogic({ 
  conversationId, 
  renderContent 
}: MessageViewLogicProps) {
  const logger = useLogger("MessageViewLogic");
  
  // Use the hook to get all the props needed for rendering
  const props = useMessageViewProps(conversationId);
  
  // Debug render counts and state
  useEffect(() => {
    logger.info(`MessageViewLogic rendered for conversation: ${conversationId}`, {
      hasMessages: props.messages.length > 0,
      messageCount: props.messages.length,
      currentProfileId: props.currentProfileId,
      hasOtherUser: !!props.otherUser,
      isLoading: props.isLoading,
      isError: props.isError,
      authStatus: props.authStatus
    });
  }, [
    conversationId, 
    props.messages.length, 
    props.currentProfileId, 
    props.otherUser, 
    props.isLoading, 
    props.isError,
    props.authStatus,
    logger
  ]);
  
  // Simply pass all the props to the render function
  return <>{renderContent(props)}</>;
}
