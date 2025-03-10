
import { useEffect, useCallback } from 'react';

interface UseMessagesLoaderProps {
  conversationId: string;
  currentProfileId: string | null;
  profileInitialized: boolean;
  isAuthChecked: boolean;
  isFetchingInitialMessages: boolean;
  setIsFetchingInitialMessages: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setIsError: (value: boolean) => void;
  fetchMessages: (useCache?: boolean) => Promise<any[] | null>;
  markMessagesAsRead: () => Promise<void>;
  messages: any[];
  logger?: any;
  permissionVerified?: boolean;
  forceRefresh?: () => Promise<any[] | null>;
}

/**
 * Hook to handle loading messages at the appropriate time
 */
export const useMessagesLoader = ({
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
}: UseMessagesLoaderProps) => {
  // On mount or when auth and profile are initialized, fetch messages
  useEffect(() => {
    const log = logger?.info || console.log;
    
    // Only run this effect when we have the required data
    if (!conversationId || !currentProfileId || !profileInitialized || !isAuthChecked) {
      log("useMessagesLoader: Not ready to load messages yet", {
        conversationId: !!conversationId,
        currentProfileId: !!currentProfileId,
        profileInitialized,
        isAuthChecked
      });
      return;
    }
    
    // Prevent duplicate fetches
    if (isFetchingInitialMessages) {
      log("useMessagesLoader: Already fetching messages, skipping");
      return;
    }
    
    // Skip if we already have messages
    if (messages.length > 0 && permissionVerified) {
      log("useMessagesLoader: Already have messages and permission verified, skipping");
      return;
    }
    
    const loadInitialMessages = async () => {
      log("useMessagesLoader: Loading initial messages for conversation", {
        conversationId,
        hasPermission: permissionVerified
      });
      
      setIsFetchingInitialMessages(true);
      
      try {
        // Use forceRefresh if permission is not verified yet
        const result = permissionVerified 
          ? await fetchMessages(true)
          : forceRefresh ? await forceRefresh() : await fetchMessages(false);
          
        log("useMessagesLoader: Initial messages fetch result", { 
          success: !!result, 
          messageCount: result?.length || 0,
          permissionVerified 
        });
        
        if (!result || result.length === 0) {
          // Try one more time without cache if the first attempt failed
          log("useMessagesLoader: No messages found, trying again without cache");
          const freshResult = await fetchMessages(false);
          log("useMessagesLoader: Fresh fetch result", {
            success: !!freshResult,
            messageCount: freshResult?.length || 0
          });
          
          setIsError(!freshResult);
        } else {
          setIsError(false);
        }
      } catch (error) {
        log("useMessagesLoader: Error loading initial messages:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
        setIsFetchingInitialMessages(false);
      }
    };
    
    loadInitialMessages();
  }, [
    conversationId,
    currentProfileId,
    profileInitialized,
    isAuthChecked,
    isFetchingInitialMessages,
    fetchMessages,
    setIsError,
    setIsLoading,
    setIsFetchingInitialMessages,
    messages.length,
    logger,
    permissionVerified,
    forceRefresh
  ]);
  
  // When messages are loaded, mark them as read
  useEffect(() => {
    if (messages.length > 0 && currentProfileId && conversationId) {
      const log = logger?.info || console.log;
      log("useMessagesLoader: Marking messages as read");
      markMessagesAsRead();
    }
  }, [messages.length, currentProfileId, conversationId, markMessagesAsRead, logger]);
  
  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    const log = logger?.info || console.log;
    
    if (!conversationId || !currentProfileId) {
      log("useMessagesLoader: Cannot refresh without conversation or profile ID");
      return;
    }
    
    log("useMessagesLoader: Manual refresh requested", {
      conversationId,
      currentProfileId,
      permissionVerified
    });
    
    setIsLoading(true);
    
    try {
      // Use forceRefresh if permission verification is missing
      const result = permissionVerified 
        ? await fetchMessages(false) 
        : forceRefresh ? await forceRefresh() : await fetchMessages(false);
        
      log("useMessagesLoader: Manual refresh result", { 
        success: !!result, 
        messageCount: result?.length || 0 
      });
      
      setIsError(!result);
    } catch (error) {
      log("useMessagesLoader: Error refreshing messages:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [
    conversationId, 
    currentProfileId, 
    fetchMessages, 
    setIsError, 
    setIsLoading, 
    logger, 
    permissionVerified,
    forceRefresh
  ]);
  
  return { handleRefresh };
};
