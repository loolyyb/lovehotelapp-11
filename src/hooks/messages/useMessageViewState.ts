
import { useState, useRef, useEffect } from "react";
import { useLogger } from "@/hooks/useLogger";
import { useProfileState } from "@/hooks/useProfileState";
import { usePageVisibility } from "@/hooks/usePageVisibility";

/**
 * Centralized state management for the message view component
 */
export const useMessageViewState = () => {
  // Messages and message input
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  // User information - now using useProfileState for central profile management
  const { profileId: centralProfileId, isInitialized: profileStateInitialized, checkAndRefreshSession } = useProfileState();
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  
  // Loading flags
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [isFetchingInitialMessages, setIsFetchingInitialMessages] = useState(false);
  const [permissionVerified, setPermissionVerified] = useState(false);
  
  // Track page visibility for state synchronization
  const { isVisible, wasHidden, setWasHidden } = usePageVisibility();
  
  // Refs for preventing duplicate operations
  const fetchingRef = useRef(false);
  const firstLoad = useRef(true);
  const logger = useLogger("useMessageViewState");
  const lastVisibleTimeRef = useRef(Date.now());
  const conversationIdRef = useRef<string | null>(null);

  // Sync with central profile state
  useEffect(() => {
    if (centralProfileId && profileStateInitialized && !currentProfileId) {
      logger.info("Syncing with central profile state", { centralProfileId });
      setCurrentProfileId(centralProfileId);
      setProfileInitialized(true);
      setIsAuthChecked(true);
    }
  }, [centralProfileId, profileStateInitialized, currentProfileId, logger]);

  // Handle visibility changes - ensure profile state is fresh when tab becomes visible again
  useEffect(() => {
    if (isVisible && wasHidden) {
      const timeSinceLastVisible = Date.now() - lastVisibleTimeRef.current;
      logger.info("MessageView became visible again after being hidden", {
        timeSinceLastVisible: `${Math.round(timeSinceLastVisible / 1000)}s`,
        hasMessages: messages.length > 0,
        profileId: currentProfileId,
        conversationId: conversationIdRef.current
      });
      
      // If visibility was lost for more than 5 seconds or we lost profile state, check session
      if (timeSinceLastVisible > 5000 || !currentProfileId) {
        logger.info("Checking session state after visibility change");
        checkAndRefreshSession().then(valid => {
          if (valid) {
            if (centralProfileId && !currentProfileId) {
              logger.info("Restoring profile ID after visibility change", { centralProfileId });
              setCurrentProfileId(centralProfileId);
              setProfileInitialized(true);
              setIsAuthChecked(true);
            }
            
            // Reset permission verification to force a recheck
            if (conversationIdRef.current) {
              setPermissionVerified(false);
            }
          }
          
          // Reset the hidden state
          setWasHidden(false);
        });
      } else {
        setWasHidden(false);
      }
    }
    
    // Update the last visible time
    if (isVisible) {
      lastVisibleTimeRef.current = Date.now();
    }
  }, [isVisible, wasHidden, logger, checkAndRefreshSession, setWasHidden, messages.length, currentProfileId, centralProfileId]);

  // Enhanced debugging
  useEffect(() => {
    if (messages.length > 0) {
      logger.info("Messages updated", {
        messageCount: messages.length,
        firstMessageId: messages[0]?.id,
        lastMessageId: messages[messages.length - 1]?.id
      });
    }
  }, [messages, logger]);

  useEffect(() => {
    logger.info("Current profile ID updated", { 
      currentProfileId,
      centralProfileId,
      profileInitialized,
      profileStateInitialized
    });
  }, [currentProfileId, centralProfileId, profileInitialized, profileStateInitialized, logger]);

  useEffect(() => {
    if (otherUser) {
      logger.info("Other user updated", {
        otherUserId: otherUser.id,
        otherUsername: otherUser.username
      });
    }
  }, [otherUser, logger]);
  
  return {
    // Message state
    messages,
    setMessages,
    newMessage,
    setNewMessage,
    
    // User state
    currentProfileId,
    setCurrentProfileId,
    otherUser,
    setOtherUser,
    
    // Loading state
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
    
    // Refs
    fetchingRef,
    firstLoad,
    logger,
    conversationIdRef
  };
};
