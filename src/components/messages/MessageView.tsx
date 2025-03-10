
import React, { useEffect, useRef, useState } from "react";
import { MessageViewLogic } from "./MessageViewLogic";
import { MessageViewContainer } from "./MessageViewContainer";
import { MessageContent } from "./MessageContent";
import { MessageInput } from "./MessageInput";
import { MessageLoadingState } from "./MessageLoadingState";
import { MessageErrorState } from "./MessageErrorState";
import { EmptyState } from "./EmptyState";

interface MessageViewProps {
  conversationId: string;
  onBack: () => void;
}

export function MessageView({ conversationId, onBack }: MessageViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);
  
  // Ensure parent container has proper dimensions
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.height = '100%';
      containerRef.current.style.display = 'flex';
      containerRef.current.style.flexDirection = 'column';
    }
    
    // Reset state on conversation change
    setInitialLoadAttempted(false);
  }, [conversationId]);

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <MessageViewLogic
        conversationId={conversationId}
        renderContent={({
          messages,
          currentProfileId,
          otherUser,
          isLoading,
          isError,
          retryLoad,
          refreshMessages,
          isRefreshing,
          loadMoreMessages,
          isLoadingMore,
          hasMoreMessages,
          newMessage,
          setNewMessage,
          sendMessage,
          authStatus,
          profileInitialized
        }) => {
          // Track initial load attempt to avoid flashing states
          useEffect(() => {
            if (!isLoading && !initialLoadAttempted) {
              setInitialLoadAttempted(true);
            }
          }, [isLoading]);
          
          // Show loading state only during first load
          const showLoading = isLoading && !initialLoadAttempted;
          
          // Show error state only after initial load attempt
          const showError = isError && initialLoadAttempted;
          
          // Show empty state only when we're sure there are no messages
          const showEmpty = messages.length === 0 && !isLoading && !isError && initialLoadAttempted;
          
          // Show messages when we have them, even if still loading more
          const showMessages = messages.length > 0 && initialLoadAttempted;
          
          return (
            <MessageViewContainer
              onBack={onBack}
              refreshMessages={refreshMessages}
              isRefreshing={isRefreshing}
              otherUser={otherUser}
              footer={
                <MessageInput
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  onSend={sendMessage}
                  disabled={showLoading || showError || !currentProfileId}
                />
              }
            >
              {showLoading ? (
                <MessageLoadingState />
              ) : showError ? (
                <MessageErrorState retryLoad={retryLoad} />
              ) : showEmpty ? (
                <EmptyState onRefresh={refreshMessages} isRefreshing={isRefreshing} />
              ) : showMessages ? (
                <MessageContent 
                  messages={messages}
                  currentProfileId={currentProfileId}
                  loadMoreMessages={loadMoreMessages}
                  isLoadingMore={isLoadingMore}
                  hasMoreMessages={hasMoreMessages}
                  isLoading={isLoading}
                  isError={isError}
                  retryLoad={retryLoad}
                />
              ) : null}
            </MessageViewContainer>
          );
        }}
      />
    </div>
  );
}
