
import React, { useEffect, useRef } from "react";
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
  
  // Ensure parent container has proper dimensions
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.height = '100%';
      containerRef.current.style.display = 'flex';
      containerRef.current.style.flexDirection = 'column';
    }
  }, []);

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
          authStatus
        }) => (
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
                disabled={isLoading || isError || !currentProfileId}
              />
            }
          >
            {isLoading ? (
              <MessageLoadingState />
            ) : isError ? (
              <MessageErrorState retryLoad={retryLoad} />
            ) : messages.length === 0 ? (
              <EmptyState onRefresh={refreshMessages} isRefreshing={isRefreshing} />
            ) : (
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
            )}
          </MessageViewContainer>
        )}
      />
    </div>
  );
}
