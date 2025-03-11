
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
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.height = '100%';
      containerRef.current.style.display = 'flex';
      containerRef.current.style.flexDirection = 'column';
    }
    
    setInitialLoadAttempted(false);
    setIsFirstLoad(true);
    
    return () => {
      setIsFirstLoad(false);
    };
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
          useEffect(() => {
            if (!isLoading && !initialLoadAttempted) {
              setInitialLoadAttempted(true);
              setTimeout(() => setIsFirstLoad(false), 300);
            }
          }, [isLoading]);
          
          const showLoading = (isLoading && isFirstLoad) || (!initialLoadAttempted && isFirstLoad);
          const showError = isError && initialLoadAttempted && !isFirstLoad;
          const showEmpty = messages.length === 0 && !isLoading && !isError && initialLoadAttempted && !isFirstLoad;
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
                <EmptyState 
                  onRefresh={refreshMessages} 
                  isRefreshing={isRefreshing} 
                  isLoading={true}
                />
              ) : showError ? (
                <MessageErrorState retryLoad={retryLoad} />
              ) : showEmpty ? (
                <EmptyState 
                  onRefresh={refreshMessages} 
                  isRefreshing={isRefreshing} 
                  isLoading={false}
                />
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
