
import { useEffect, useCallback } from "react";
import { useLogger } from "@/hooks/useLogger";

interface UseMessagesLoaderProps {
  conversationId: string;
  currentProfileId: string | null;
  profileInitialized: boolean;
  isAuthChecked: boolean;
  isFetchingInitialMessages: boolean;
  setIsFetchingInitialMessages: (isFetching: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsError: (isError: boolean) => void;
  fetchMessages: (useCache?: boolean) => Promise<any[] | null>;
  markMessagesAsRead: () => Promise<void>;
  messages: any[];
}

/**
 * Hook for managing message loading lifecycle
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
  const logger = useLogger("useMessagesLoader");

  // Fetch messages when profile is initialized - with debounce
  useEffect(() => {
    let mounted = true;
    let debounceTimeout: NodeJS.Timeout;
    
    const loadMessages = async () => {
      if (!currentProfileId || !profileInitialized || !isAuthChecked || isFetchingInitialMessages) {
        return;
      }
      
      setIsFetchingInitialMessages(true);
      logger.info("Profile initialized, fetching messages", { 
        profileId: currentProfileId,
        conversationId 
      });
      
      try {
        await fetchMessages();
      } catch (error: any) {
        logger.error("Error fetching messages", { 
          error: error.message,
          stack: error.stack
        });
        
        if (mounted) {
          setIsError(true);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsFetchingInitialMessages(false);
        }
      }
    };
    
    // Add debounce to prevent multiple rapid API calls
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(loadMessages, 100);
    
    return () => {
      mounted = false;
      clearTimeout(debounceTimeout);
    };
  }, [currentProfileId, profileInitialized, isAuthChecked, conversationId, fetchMessages, isFetchingInitialMessages, setIsFetchingInitialMessages, setIsError, setIsLoading, logger]);

  // Handle marking messages as read with debounce
  useEffect(() => {
    let markAsReadTimeout: NodeJS.Timeout;
    
    if (currentProfileId && messages.length > 0 && !isFetchingInitialMessages) {
      logger.info("Checking for unread messages after update", {
        messagesCount: messages.length,
        profileId: currentProfileId
      });
      
      const hasUnreadMessages = messages.some(
        msg => msg.sender_id !== currentProfileId && !msg.read_at
      );
      
      if (hasUnreadMessages) {
        logger.info("Found unread messages, marking as read", {
          profileId: currentProfileId
        });
        // Add debounce to prevent multiple rapid API calls
        clearTimeout(markAsReadTimeout);
        markAsReadTimeout = setTimeout(() => markMessagesAsRead(), 700);
      }
    }
    
    return () => {
      clearTimeout(markAsReadTimeout);
    };
  }, [messages, currentProfileId, isFetchingInitialMessages, markMessagesAsRead, logger]);

  // Refresh messages handler
  const handleRefresh = useCallback(async () => {
    logger.info("Manually refreshing messages", { conversationId });
    await fetchMessages(false); // Skip cache on manual refresh
  }, [fetchMessages, conversationId, logger]);

  return {
    handleRefresh
  };
};
