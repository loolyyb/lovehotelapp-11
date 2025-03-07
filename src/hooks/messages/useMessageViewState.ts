
import { useState, useRef } from "react";
import { useLogger } from "@/hooks/useLogger";

/**
 * Hook to manage message view states
 */
export const useMessageViewState = () => {
  // Message states
  const [messages, setMessages] = useState<any[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [isFetchingInitialMessages, setIsFetchingInitialMessages] = useState(false);
  
  // Refs for tracking loading states
  const fetchingRef = useRef(false);
  const firstLoad = useRef(true);
  const logger = useLogger("useMessageViewState");

  return {
    // Message states
    messages,
    setMessages,
    currentProfileId,
    setCurrentProfileId,
    otherUser,
    setOtherUser,
    newMessage,
    setNewMessage,
    
    // Loading states
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
