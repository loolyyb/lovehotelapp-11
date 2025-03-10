
import { useState, useRef, useEffect } from "react";
import { useLogger } from "@/hooks/useLogger";
import { useProfileState } from "@/hooks/useProfileState";

/**
 * Centralized state management for the message view component
 */
export const useMessageViewState = () => {
  // Messages and message input
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  // User information - now using useProfileState for central profile management
  const { profileId: centralProfileId, isInitialized: profileStateInitialized } = useProfileState();
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  
  // Loading flags
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [isFetchingInitialMessages, setIsFetchingInitialMessages] = useState(false);
  
  // Refs for preventing duplicate operations
  const fetchingRef = useRef(false);
  const firstLoad = useRef(true);
  const logger = useLogger("useMessageViewState");

  // Sync with central profile state
  useEffect(() => {
    if (centralProfileId && profileStateInitialized && !currentProfileId) {
      logger.info("Syncing with central profile state", { centralProfileId });
      setCurrentProfileId(centralProfileId);
      setProfileInitialized(true);
      setIsAuthChecked(true);
    }
  }, [centralProfileId, profileStateInitialized, currentProfileId, logger]);

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
    
    // Refs
    fetchingRef,
    firstLoad,
    logger
  };
};
