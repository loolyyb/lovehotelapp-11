import React, { useCallback, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLogger } from "@/hooks/useLogger";
import { useMessageRetrieval } from "@/hooks/messages/useMessageRetrieval";
import { useConversationInit } from "@/hooks/useConversationInit";
import { useMessageRefresh } from "@/hooks/useMessageRefresh";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useMessageHandlers } from "@/hooks/useMessageHandlers";
import { useMessageViewState } from "@/hooks/messages/useMessageViewState";
import { useMessageInitializer } from "@/hooks/messages/useMessageInitializer";
import { useMessagesLoader } from "@/hooks/messages/useMessagesLoader";
import { useProfileState } from "@/hooks/useProfileState";

/**
 * Hook to prepare all props needed for the MessageView component
 */
export function useMessageViewProps(conversationId: string) {
  const { toast } = useToast();
  const logger = useLogger("useMessageViewProps");
  
  // Connect to centralized profile state
  const { profileId, profile, isLoading: profileLoading, error: profileError, isInitialized: profileStateInitialized } = useProfileState();
  
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
    logger: stateLogger
  } = useMessageViewState();

  // Synchronize with centralized profile state
  useEffect(() => {
    if (profileId && profileStateInitialized) {
      logger.info("Setting profile ID from central state", { profileId });
      setCurrentProfileId(profileId);
      setProfileInitialized(true);
      setIsAuthChecked(true);
    }
  }, [profileId, profileStateInitialized, setCurrentProfileId, setProfileInitialized, setIsAuthChecked, logger]);

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

  // Initialize message authentication if not already done via the central profile state
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
    toast 
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

  // Setup message loading with enhanced debug
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
    messages,
    logger
  });

  // Message realtime update handlers - Improved for better UI updates
  const handleNewMessage = useCallback((message) => {
    if (message.conversation_id === conversationId) {
      logger.info("New message received, updating messages list", { 
        messageId: message.id, 
        senderId: message.sender_id,
        currentProfileId
      });
      
      // Directly add to messages state for immediate display
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        if (prev.some(m => m.id === message.id || (m.optimistic && m.content === message.content))) {
          return prev;
        }
        
        const updatedMessages = [...prev, message].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        logger.info("Messages list updated with new message", { 
          totalMessages: updatedMessages.length,
          latestMessageId: updatedMessages[updatedMessages.length - 1]?.id
        });
        
        return updatedMessages;
      });
      
      // Also update cache to ensure persistence
      addMessageToCache(message);
      
      // Mark as read after a short delay if message is from other user
      if (currentProfileId && message.sender_id !== currentProfileId) {
        setTimeout(() => {
          markMessagesAsRead();
        }, 500);
      }
    }
  }, [conversationId, addMessageToCache, setMessages, logger, currentProfileId, markMessagesAsRead]);

  const handleMessageUpdate = useCallback((message) => {
    if (message.conversation_id === conversationId) {
      logger.info("Message updated, updating messages list", { messageId: message.id });
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? message : msg
      ));
    }
  }, [conversationId, setMessages, logger]);

  // Setup realtime message updates with improved subscription
  const { trackSentMessage } = useRealtimeMessages({
    currentProfileId,
    onNewMessage: handleNewMessage,
    onMessageUpdate: handleMessageUpdate
  });

  // Setup message sending with direct access to message state
  const { sendMessage } = useMessageHandlers({
    currentProfileId,
    conversationId,
    newMessage,
    setNewMessage,
    toast,
    setMessages,
    addMessageToCache,
    trackSentMessage
  });

  // Create an auth status string for debugging
  const authStatus = useMemo(() => {
    return `profileId:${!!profileId}|current:${!!currentProfileId}|initialized:${profileInitialized}|checked:${isAuthChecked}`;
  }, [profileId, currentProfileId, profileInitialized, isAuthChecked]);

  // Combined loading state
  const showLoader = useMemo(() => 
    isLoading && (!messages.length || !isAuthChecked || !profileInitialized || isFetchingInitialMessages),
    [isLoading, messages.length, isAuthChecked, profileInitialized, isFetchingInitialMessages]
  );

  // Force message fetch if we have all required data but no messages
  useEffect(() => {
    if (
      currentProfileId && 
      profileInitialized && 
      isAuthChecked && 
      !isFetchingInitialMessages && 
      !isError && 
      messages.length === 0 && 
      !showLoader
    ) {
      logger.info("Force fetching messages - we have auth but no messages", {
        conversationId,
        currentProfileId,
        profileInitialized,
        isAuthChecked
      });
      handleRefresh();
    }
  }, [
    currentProfileId, 
    profileInitialized, 
    isAuthChecked, 
    isFetchingInitialMessages, 
    messages.length, 
    isError, 
    showLoader, 
    conversationId, 
    handleRefresh,
    logger
  ]);

  // Create a wrapped sendMessage function that handles undefined event properly
  const handleSendMessage = useCallback((e?: React.FormEvent) => {
    // Call the actual sendMessage function with the event, which now properly handles optional events
    sendMessage(e);
  }, [sendMessage]);

  // Prepare render props
  return useMemo(() => ({
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
    sendMessage: handleSendMessage,
    authStatus,
    profileInitialized
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
    handleSendMessage,
    authStatus,
    profileInitialized
  ]);
}
