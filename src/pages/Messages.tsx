
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useLogger } from "@/hooks/useLogger";
import { supabase } from "@/integrations/supabase/client"; 
import { useToast } from "@/hooks/use-toast";
import { ConnectionErrorState } from "@/components/messages/ConnectionErrorState";
import { MessagesContainer } from "@/components/messages/MessagesContainer";
import { useConnectionStatus } from "@/hooks/messages/useConnectionStatus";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useProfileState } from "@/hooks/useProfileState";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const location = useLocation();
  const logger = useLogger("Messages");
  const previousConversationRef = useRef<string | null>(null);
  const { toast } = useToast();
  const mountedRef = useRef(true);
  const refreshAttemptRef = useRef(0);
  const lastVisibleTimeRef = useRef(Date.now());

  // Track page visibility
  const { isVisible, wasHidden, setWasHidden } = usePageVisibility();
  
  // Access central profile state
  const { profileId, refreshProfile } = useProfileState();

  const { 
    isCheckingConnection, 
    connectionError, 
    isNetworkError, 
    setIsNetworkError, 
    checkConnectionStatus 
  } = useConnectionStatus();

  // Effect to initialize and cleanup component
  useEffect(() => {
    logger.info("Messages page mounted");
    mountedRef.current = true;
    checkConnectionStatus();
    
    if (location.state?.conversationId) {
      logger.info("Setting conversation from location state", { conversationId: location.state.conversationId });
      setSelectedConversation(location.state.conversationId);
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [location.state, logger, checkConnectionStatus]);

  // Handle visibility changes - refresh data when returning to the page
  useEffect(() => {
    if (isVisible && wasHidden) {
      const timeSinceLastVisible = Date.now() - lastVisibleTimeRef.current;
      logger.info("Page became visible again after being hidden", { 
        timeSinceLastVisible: `${Math.round(timeSinceLastVisible / 1000)}s`
      });
      
      // Only force refresh if it's been hidden for more than 30 seconds
      if (timeSinceLastVisible > 30000) {
        logger.info("Tab was hidden for a significant time, refreshing state");
        
        // Refresh profile to ensure we have the latest state
        refreshProfile().then(() => {
          // Force a refresh of conversations
          handleRefreshConversations();
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
  }, [isVisible, wasHidden, logger, refreshProfile, setWasHidden]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    if (selectedConversation === conversationId) {
      logger.info("Conversation already selected, ignoring", { conversationId });
      return;
    }
    
    previousConversationRef.current = selectedConversation;
    logger.info("Changing selected conversation", { 
      from: previousConversationRef.current, 
      to: conversationId 
    });
    
    setSelectedConversation(conversationId);
  }, [selectedConversation, logger]);

  const handleBack = useCallback(() => {
    logger.info("Navigating back from conversation view");
    setSelectedConversation(null);
  }, [logger]);

  const handleRefreshConversations = useCallback(async () => {
    logger.info("Manually refreshing conversations");
    
    refreshAttemptRef.current += 1;
    const currentAttempt = refreshAttemptRef.current;
    
    try {
      await checkConnectionStatus();
      
      if (!connectionError && isNetworkError && mountedRef.current && currentAttempt === refreshAttemptRef.current) {
        setIsNetworkError(false);
        window.location.reload();
        return;
      }
      
      if (!connectionError && mountedRef.current && currentAttempt === refreshAttemptRef.current) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated user");
        
        // If we have a valid user, don't show a toast for automatic refreshes due to tab visibility
        if (!wasHidden) {
          toast({
            title: "Actualisation réussie",
            description: "Vos conversations ont été actualisées"
          });
        }
      }
    } catch (error) {
      logger.error("Error during refresh", { error });
      
      if (mountedRef.current) {
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: "Impossible de récupérer votre profil. Veuillez réessayer."
        });
      }
    }
  }, [connectionError, isNetworkError, logger, toast, checkConnectionStatus, setIsNetworkError, wasHidden]);

  if (connectionError) {
    return (
      <ConnectionErrorState
        errorMessage={connectionError}
        isCheckingConnection={isCheckingConnection}
        onRetry={checkConnectionStatus}
      />
    );
  }

  return (
    <MessagesContainer
      selectedConversation={selectedConversation}
      onSelectConversation={handleSelectConversation}
      onBack={handleBack}
      onRefresh={handleRefreshConversations}
      isRefreshing={isCheckingConnection}
      isNetworkError={isNetworkError}
    />
  );
}
