
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
      return;
    }
    
    // Prevent duplicate fetches
    if (isFetchingInitialMessages) {
      return;
    }
    
    // Skip if we already have messages
    if (messages.length > 0) {
      return;
    }
    
    const loadInitialMessages = async () => {
      setIsFetchingInitialMessages(true);
      
      try {
        await fetchMessages(true);
        setIsError(false);
      } catch (error) {
        setIsError(true);
        console.error("Error loading initial messages:", error);
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
      markMessagesAsRead();
    }
  }, [messages.length, currentProfileId, conversationId, markMessagesAsRead]);
  
  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    if (!conversationId || !currentProfileId) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await fetchMessages(false); // Skip cache on manual refresh
      setIsError(false);
    } catch (error) {
      setIsError(true);
      console.error("Error refreshing messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, currentProfileId, fetchMessages, setIsError, setIsLoading]);
  
  return { handleRefresh };
};
