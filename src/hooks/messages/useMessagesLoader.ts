
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
  messages
}: UseMessagesLoaderProps) => {
  // On mount or when auth and profile are initialized, fetch messages
  useEffect(() => {
    // Only run this effect when we have the required data
    if (!conversationId || !currentProfileId || !profileInitialized || !isAuthChecked) {
      console.log("useMessagesLoader: Not ready to load messages yet", {
        conversationId: !!conversationId,
        currentProfileId: !!currentProfileId,
        profileInitialized,
        isAuthChecked
      });
      return;
    }
    
    // Prevent duplicate fetches
    if (isFetchingInitialMessages) {
      console.log("useMessagesLoader: Already fetching messages, skipping");
      return;
    }
    
    // Skip if we already have messages
    if (messages.length > 0) {
      console.log("useMessagesLoader: Already have messages, skipping");
      return;
    }
    
    const loadInitialMessages = async () => {
      console.log("useMessagesLoader: Loading initial messages for conversation", conversationId);
      setIsFetchingInitialMessages(true);
      
      try {
        const result = await fetchMessages(true);
        console.log("useMessagesLoader: Initial messages fetch result", { 
          success: !!result, 
          messageCount: result?.length || 0 
        });
        setIsError(!result);
      } catch (error) {
        console.error("useMessagesLoader: Error loading initial messages:", error);
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
    messages.length
  ]);
  
  // When messages are loaded, mark them as read
  useEffect(() => {
    if (messages.length > 0 && currentProfileId && conversationId) {
      console.log("useMessagesLoader: Marking messages as read");
      markMessagesAsRead();
    }
  }, [messages.length, currentProfileId, conversationId, markMessagesAsRead]);
  
  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    if (!conversationId || !currentProfileId) {
      console.log("useMessagesLoader: Cannot refresh without conversation or profile ID");
      return;
    }
    
    console.log("useMessagesLoader: Manual refresh requested");
    setIsLoading(true);
    
    try {
      const result = await fetchMessages(false); // Skip cache on manual refresh
      console.log("useMessagesLoader: Manual refresh result", { 
        success: !!result, 
        messageCount: result?.length || 0 
      });
      setIsError(!result);
    } catch (error) {
      console.error("useMessagesLoader: Error refreshing messages:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, currentProfileId, fetchMessages, setIsError, setIsLoading]);
  
  return { handleRefresh };
};
