
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
  
  // Debug render counts
  useEffect(() => {
    console.log(`MessageViewLogic rendered for conversation: ${conversationId}`);
  }, [conversationId]);
  
  // Simply pass all the props to the render function
  return <>{renderContent(props)}</>;
}
