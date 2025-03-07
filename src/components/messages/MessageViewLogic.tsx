
import React, { useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMessageRetrieval } from "@/hooks/messages/useMessageRetrieval";
import { useConversationInit } from "@/hooks/useConversationInit";
import { useMessageRefresh } from "@/hooks/useMessageRefresh";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useMessageHandlers } from "@/hooks/useMessageHandlers";
import { useMessageViewState } from "@/hooks/messages/useMessageViewState";
import { useMessageInitializer } from "@/hooks/messages/useMessageInitializer";
import { useMessagesLoader } from "@/hooks/messages/useMessagesLoader";

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

export function MessageViewLogic({ conversationId, renderContent }: MessageViewLogicProps) {
  const { toast } = useToast();
  
  // Use the message view state hook to manage state
  const {
    messages,
    setMessages,
    currentProfileId,
    setCurrentProfileId,
    otherUser,
    setOtherUser,
    newMessage,
    setNewMessage,
    isLoading,
    setIsLoading,
    isAuthChecked,
    setIsAuthChecked,
    profileInitialized,
    setProfileInitialized,
    isFetchingInitialMessages,
    setIsFetchingInitialMessages,
    fetchingRef,
    firstLoad,
    logger
  } = useMessageViewState();

  // Setup conversation initialization
  const { getCurrentUser } = useConversationInit({
    conversationId,
    setMessages,
    setCurrentProfileId: (profileId) => {
      setCurrentProfileId(profileId);
      if (profileId) {
        setProfileInitialized(true);
      }
    },
    setOtherUser,
    setIsLoading,
  });

  // Initialize message authentication
  const { memoizedProfileSetter } = useMessageInitializer({
    conversationId,
    fetchingRef,
    firstLoad,
    setCurrentProfileId,
    setIsAuthChecked,
    setIsLoading,
    setIsError: () => {}, // Will be set by useMessageRefresh
    getCurrentUser,
  });

  // Setup message retrieval
  const { 
    fetchMessages, 
    loadMoreMessages, 
    markMessagesAsRead, 
    addMessageToCache,
    isLoadingMore,
    hasMoreMessages,
    isFetchingMore
  } = useMessageRetrieval({
    conversationId,
    currentProfileId,
    setMessages,
    toast,
  });

  // Setup message refresh
  const { 
    isRefreshing, 
    isError, 
    isLoading: refreshLoading, 
    setIsError, 
    setIsLoading: setRefreshLoading, 
    refreshMessages, 
    retryLoad 
  } = useMessageRefresh({
    conversationId,
    fetchMessages,
    getCurrentUser,
    currentProfileId,
  });

  // Setup message loading
  const { handleRefresh } = useMessagesLoader({
    conversationId,
    currentProfileId,
    profileInitialized,
    isAuthChecked,
    isFetchingInitialMessages,
    setIsFetchingInitialMessages,
    setIsLoading,
    setIsError,
    fetchMessages,
    markMessagesAsRead,
    messages
  });

  // Setup message sending
  const { sendMessage } = useMessageHandlers({
    currentProfileId,
    conversationId,
    newMessage,
    setNewMessage,
    toast,
  });

  // Message realtime update handlers
  const handleNewMessage = useCallback((message) => {
    if (message.conversation_id === conversationId) {
      logger.info("New message received, updating messages list", { messageId: message.id });
      // Use optimistic update via cache
      addMessageToCache(message);
    }
  }, [conversationId, addMessageToCache, logger]);

  const handleMessageUpdate = useCallback((message) => {
    if (message.conversation_id === conversationId) {
      logger.info("Message updated, updating messages list", { messageId: message.id });
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? message : msg
      ));
    }
  }, [conversationId, setMessages, logger]);

  // Setup realtime message updates
  useRealtimeMessages({
    currentProfileId,
    onNewMessage: handleNewMessage,
    onMessageUpdate: handleMessageUpdate
  });

  // Combined loading state
  const showLoader = useMemo(() => 
    isLoading && (!messages.length || !isAuthChecked || !profileInitialized || isFetchingInitialMessages),
    [isLoading, messages.length, isAuthChecked, profileInitialized, isFetchingInitialMessages]
  );

  // Prepare render props
  const renderProps = useMemo(() => ({
    messages,
    currentProfileId,
    otherUser,
    isLoading: showLoader,
    isError,
    retryLoad,
    refreshMessages: handleRefresh,
    isRefreshing,
    loadMoreMessages,
    isLoadingMore: isLoadingMore || isFetchingMore,
    hasMoreMessages,
    newMessage,
    setNewMessage,
    sendMessage
  }), [
    messages,
    currentProfileId,
    otherUser,
    showLoader,
    isError,
    retryLoad,
    handleRefresh,
    isRefreshing,
    loadMoreMessages,
    isLoadingMore,
    isFetchingMore,
    hasMoreMessages,
    newMessage,
    setNewMessage,
    sendMessage
  ]);

  return renderContent(renderProps);
}
