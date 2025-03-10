
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
  const { 
    profileId, 
    profile, 
    isLoading: profileLoading, 
    error: profileError, 
    isInitialized: profileStateInitialized,
    checkAndRefreshSession
  } = useProfileState();
  
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
    permissionVerified,
    setPermissionVerified,
    fetchingRef,
    firstLoad,
    logger: stateLogger,
    conversationIdRef
  } = useMessageViewState();

  // Keep track of the current conversation ID for visibility handling
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId, conversationIdRef]);

  // Synchronize with centralized profile state with improved error handling
  useEffect(() => {
    // Only attempt to set profile if we have a valid profile and it's different from currentProfileId
    if (profileId && profileStateInitialized && (!currentProfileId || profileId !== currentProfileId)) {
      logger.info("Setting profile ID from central state", { 
        profileId, 
        currentProfileId,
        isInitialized: profileStateInitialized 
      });
      
      setCurrentProfileId(profileId);
      setProfileInitialized(true);
      setIsAuthChecked(true);
    } else if (!profileId && profileStateInitialized && !profileLoading) {
      // Handle case where profile state is initialized but no profile ID is available
      logger.warn("Profile state initialized but no profile ID available", {
        profileId,
        currentProfileId,
        profileStateInitialized,
        profileLoading
      });
      
      // If we're supposed to have auth but don't, try to refresh the session
      if (!currentProfileId) {
        logger.info("Attempting to refresh session to retrieve profile");
        checkAndRefreshSession().then(valid => {
          logger.info("Session refresh result", { valid });
        });
      }
    }
  }, [
    profileId, 
    profileStateInitialized, 
    currentProfileId, 
    setCurrentProfileId, 
    setProfileInitialized, 
    setIsAuthChecked, 
    logger,
    profileLoading,
    checkAndRefreshSession
  ]);

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

  // Setup message retrieval with permission verification state
  const { 
    fetchMessages, 
    loadMoreMessages, 
    markMessagesAsRead, 
    addMessageToCache,
    forceRefresh,
    isLoadingMore,
    hasMoreMessages,
    isFetchingMore
  } = useMessageRetrieval({
    conversationId, 
    currentProfileId, 
    setMessages, 
    toast,
    permissionVerified,
    setPermissionVerified
  });

  // Setup message refresh
  const { 
    isRefreshing, 
    isError, 
    isLoading: refreshLoading, 
    setIsError, 
    setIsLoading: setRefreshLoading, 
    refreshMessages: refreshMessagesOriginal, 
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
    logger,
    permissionVerified,
    forceRefresh
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
    return `profileId:${!!profileId}|current:${!!currentProfileId}|initialized:${profileInitialized}|checked:${isAuthChecked}|permVerified:${permissionVerified}`;
  }, [profileId, currentProfileId, profileInitialized, isAuthChecked, permissionVerified]);

  // Combined loading state with improved loading detection
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
        isAuthChecked,
        permissionVerified
      });
      
      // Use forceRefresh for more aggressive refresh when needed
      if (!permissionVerified && forceRefresh) {
        logger.info("Using forceRefresh because permission not verified");
        forceRefresh().then(result => {
          logger.info("forceRefresh result", {
            success: !!result,
            messageCount: result?.length || 0
          });
        });
      } else {
        logger.info("Using handleRefresh for regular refresh");
        handleRefresh();
      }
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
    permissionVerified,
    handleRefresh,
    forceRefresh,
    logger
  ]);

  // Force permission verification when lost
  useEffect(() => {
    if (
      currentProfileId && 
      profileInitialized && 
      isAuthChecked && 
      !permissionVerified && 
      !isFetchingInitialMessages &&
      forceRefresh
    ) {
      logger.info("Forcing permission verification", {
        conversationId,
        currentProfileId
      });
      
      forceRefresh().then(result => {
        logger.info("Permission verification result", {
          success: !!result,
          messageCount: result?.length || 0
        });
      });
    }
  }, [
    currentProfileId,
    profileInitialized,
    isAuthChecked,
    permissionVerified,
    isFetchingInitialMessages,
    conversationId,
    forceRefresh,
    logger
  ]);

  // Create a wrapped refreshMessages function that adapts the return type to Promise<void>
  const refreshMessages = useCallback(async () => {
    logger.info("Wrapped refreshMessages called");
    
    try {
      // Call the appropriate refresh method based on permission state
      if (permissionVerified) {
        logger.info("Using handleRefresh for refreshMessages (permission verified)");
        await handleRefresh();
      } else if (forceRefresh) {
        logger.info("Using forceRefresh for refreshMessages (permission not verified)");
        const result = await forceRefresh();
        logger.info("forceRefresh result", {
          success: !!result,
          messageCount: result?.length || 0
        });
      } else {
        // Fallback if neither are available
        logger.info("Fallback: Using handleRefresh even though permission not verified");
        await handleRefresh();
      }
    } catch (error) {
      logger.error("Error in refreshMessages:", error);
    }
    
    // Don't return anything (void)
  }, [permissionVerified, handleRefresh, forceRefresh, logger]);

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
    refreshMessages,
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
    refreshMessages,
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
