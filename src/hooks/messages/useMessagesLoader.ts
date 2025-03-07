
import { useEffect, useCallback } from 'react';
import { useLogger } from '@/hooks/useLogger';

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
 * Hook to handle message loading logic with optimized performance
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
  const logger = useLogger('MessagesLoader');
  
  // Load messages when dependencies are ready
  useEffect(() => {
    // Only proceed if we have required data and aren't already fetching
    if (
      conversationId &&
      currentProfileId &&
      profileInitialized &&
      isAuthChecked &&
      !isFetchingInitialMessages
    ) {
      logger.info('Initial conditions met for fetching messages', {
        conversationId,
        profileId: currentProfileId
      });
      
      setIsFetchingInitialMessages(true);
      
      // Fetch messages (with a slight delay to prevent UI jank)
      setTimeout(async () => {
        try {
          await fetchMessages(true);
          setIsError(false);
        } catch (error) {
          logger.error('Error fetching initial messages', { error });
          setIsError(true);
        } finally {
          setIsFetchingInitialMessages(false);
          setIsLoading(false);
        }
      }, 100);
    }
  }, [
    conversationId,
    currentProfileId,
    profileInitialized,
    isAuthChecked,
    isFetchingInitialMessages,
    setIsFetchingInitialMessages,
    fetchMessages,
    setIsError,
    setIsLoading,
    logger
  ]);
  
  // Mark messages as read when they're loaded
  useEffect(() => {
    if (
      messages.length > 0 &&
      currentProfileId &&
      conversationId &&
      !isFetchingInitialMessages
    ) {
      // Small delay to prioritize UI rendering first
      const timer = setTimeout(() => {
        markMessagesAsRead();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [
    messages.length,
    currentProfileId,
    conversationId,
    isFetchingInitialMessages,
    markMessagesAsRead
  ]);
  
  // Handle refresh - optimized to prevent unnecessary renders
  const handleRefresh = useCallback(async () => {
    // Only refresh if we have the necessary data
    if (!conversationId || !currentProfileId) {
      logger.warn('Cannot refresh messages, missing required data', {
        hasConversationId: !!conversationId,
        hasProfileId: !!currentProfileId
      });
      return;
    }
    
    logger.info('Refreshing messages', { conversationId });
    
    try {
      // Skip cache for manual refresh
      await fetchMessages(false);
    } catch (error) {
      logger.error('Error refreshing messages', { error });
      setIsError(true);
    }
  }, [conversationId, currentProfileId, fetchMessages, setIsError, logger]);
  
  return { handleRefresh };
};
