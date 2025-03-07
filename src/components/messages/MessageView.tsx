
import React from "react";
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
  return (
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
        sendMessage
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
              isLoading={isLoading}
              isError={isError}
              messages={messages}
              currentProfileId={currentProfileId}
              retryLoad={retryLoad}
              loadMoreMessages={loadMoreMessages}
              isLoadingMore={isLoadingMore}
              hasMoreMessages={hasMoreMessages}
            />
          )}
        </MessageViewContainer>
      )}
    />
  );
}
