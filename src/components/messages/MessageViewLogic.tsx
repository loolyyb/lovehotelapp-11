
import React from "react";
import { useMessageViewProps } from "./logic/useMessageViewProps";
import { MessageViewRenderer } from "./logic/MessageViewRenderer";

interface MessageViewLogicProps {
  conversationId: string;
  renderContent: (props: {
    messages: any[];
    currentProfileId: string | null;
    otherUser: any;
    isLoading: boolean;
    isError: boolean;
    retryLoad: () => void;
    refreshMessages: () => void;
    isRefreshing: boolean;
    loadMoreMessages: () => void;
    isLoadingMore: boolean;
    hasMoreMessages: boolean;
    newMessage: string;
    setNewMessage: (message: string) => void;
    sendMessage: (e: React.FormEvent) => void;
  }) => React.ReactNode;
}

/**
 * Component that handles all the logic for the message view
 * and passes props to a render function for the UI
 */
export function MessageViewLogic({ conversationId, renderContent }: MessageViewLogicProps) {
  // Get all the props needed for the message view from our custom hook
  const viewProps = useMessageViewProps(conversationId);
  
  // Render the UI using the provided render function and our props
  return (
    <MessageViewRenderer
      conversationId={conversationId}
      viewProps={viewProps}
      renderContent={renderContent}
    />
  );
}
