
import { useEffect, useCallback, useRef } from 'react';

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
 * with improved error handling and retry logic
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
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchingRef = useRef(false);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3; 
  const permissionCheckedRef = useRef(false);

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
    if (isFetchingInitialMessages || fetchingRef.current) {
      log("useMessagesLoader: Already fetching messages, skipping");
      return;
    }
    
    // Skip if we already have messages and permission verified
    if (messages.length > 0 && permissionVerified && permissionCheckedRef.current) {
      log("useMessagesLoader: Already have messages and permission verified, skipping");
      return;
    }
    
    const loadInitialMessages = async () => {
      log("useMessagesLoader: Loading initial messages for conversation", {
        conversationId,
        hasPermission: permissionVerified,
        profileId: currentProfileId
      });
      
      setIsFetchingInitialMessages(true);
      fetchingRef.current = true;
      
      // Set a timeout to catch hanging fetch operations
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      // Increased timeout for more reliable loading
      fetchTimeoutRef.current = setTimeout(() => {
        log("useMessagesLoader: Fetch operation timeout after 20 seconds");
        if (fetchingRef.current && isFetchingInitialMessages) {
          setIsFetchingInitialMessages(false);
          fetchingRef.current = false;
          setIsLoading(false);
          
          // Only set error if we don't have messages
          if (messages.length === 0) {
            setIsError(true);
          }
        }
      }, 20000); // 20 second timeout
      
      try {
        // Choose the appropriate fetch method based on permission status
        let result = null;
        
        if (permissionVerified) {
          // If permission is verified, use regular fetch with cache
          result = await fetchMessages(true);
          log("useMessagesLoader: Fetched messages with verified permission", {
            success: !!result,
            messageCount: result?.length || 0
          });
          permissionCheckedRef.current = true;
        } else if (forceRefresh) {
          // If permission not verified, use force refresh to check permissions
          log("useMessagesLoader: Using forceRefresh because permission not verified");
          result = await forceRefresh();
          log("useMessagesLoader: Force refresh result", {
            success: !!result,
            messageCount: result?.length || 0
          });
          permissionCheckedRef.current = true;
        } else {
          // Fallback to normal fetch
          log("useMessagesLoader: Using normal fetch as fallback");
          result = await fetchMessages(false);
        }
          
        log("useMessagesLoader: Initial messages fetch result", { 
          success: !!result, 
          messageCount: result?.length || 0,
          permissionVerified,
          conversationId
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
        
        // Retry on failure with exponential backoff
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          const delay = Math.pow(2, retryCountRef.current) * 1000;
          log(`useMessagesLoader: Retrying in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`);
          
          setTimeout(() => {
            fetchingRef.current = false;
            setIsFetchingInitialMessages(false);
            // Reset the effect dependency to trigger a retry
            setIsLoading(true);
          }, delay);
        } else {
          setIsError(true);
          retryCountRef.current = 0;
        }
      } finally {
        // Clear the timeout
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
          fetchTimeoutRef.current = null;
        }
        
        setIsLoading(false);
        setIsFetchingInitialMessages(false);
        fetchingRef.current = false;
      }
    };
    
    loadInitialMessages();
    
    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
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
  
  // Handle manual refresh with improved error handling
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
      // Choose appropriate refresh method based on permissions
      let result = null;
      if (permissionVerified) {
        result = await fetchMessages(false); // Skip cache on manual refresh
        log("useMessagesLoader: Refreshed messages with regular fetch", {
          success: !!result,
          messageCount: result?.length || 0
        });
      } else if (forceRefresh) {
        log("useMessagesLoader: Using forceRefresh for manual refresh");
        result = await forceRefresh();
        log("useMessagesLoader: Force refresh result", {
          success: !!result,
          messageCount: result?.length || 0
        });
      } else {
        // Fallback to normal fetch
        log("useMessagesLoader: Using normal fetch as fallback for manual refresh");
        result = await fetchMessages(false);
      }
        
      log("useMessagesLoader: Manual refresh result", { 
        success: !!result, 
        messageCount: result?.length || 0,
        conversationId
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
