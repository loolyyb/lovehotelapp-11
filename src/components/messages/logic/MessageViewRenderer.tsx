
import React, { useEffect } from "react";

interface MessageViewRendererProps {
  conversationId: string;
  viewProps: any;
  renderContent: (props: any) => React.ReactNode;
}

export function MessageViewRenderer({ 
  conversationId, 
  viewProps, 
  renderContent 
}: MessageViewRendererProps) {
  // Set document title when conversation changes
  useEffect(() => {
    if (viewProps.otherUser && (viewProps.otherUser.username || viewProps.otherUser.full_name)) {
      document.title = `Chat avec ${viewProps.otherUser.username || viewProps.otherUser.full_name}`;
      
      // Reset title when unmounting
      return () => {
        document.title = "Messages | Love Hotel";
      };
    }
  }, [viewProps.otherUser]);

  // Create a stable props object to avoid excessive re-renders
  // Only include the properties that renderContent needs
  const stableProps = {
    messages: viewProps.messages || [],
    currentProfileId: viewProps.currentProfileId,
    otherUser: viewProps.otherUser,
    isLoading: viewProps.isLoading,
    isError: viewProps.isError,
    retryLoad: viewProps.retryLoad,
    refreshMessages: viewProps.refreshMessages,
    isRefreshing: viewProps.isRefreshing,
    loadMoreMessages: viewProps.loadMoreMessages,
    isLoadingMore: viewProps.isLoadingMore,
    hasMoreMessages: viewProps.hasMoreMessages,
    newMessage: viewProps.newMessage,
    setNewMessage: viewProps.setNewMessage,
    sendMessage: viewProps.sendMessage
  };

  // Pass all view props to the render function
  return <>{renderContent(stableProps)}</>;
}
