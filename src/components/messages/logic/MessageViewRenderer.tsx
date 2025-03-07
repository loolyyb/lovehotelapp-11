
import React from "react";

interface MessageViewRendererProps {
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
  viewProps: ReturnType<typeof import('./useMessageViewProps').useMessageViewProps>;
}

/**
 * Component that renders the content using the provided render function and props
 */
export function MessageViewRenderer({ 
  conversationId, 
  renderContent,
  viewProps
}: MessageViewRendererProps) {
  return <>{renderContent(viewProps)}</>;
}
