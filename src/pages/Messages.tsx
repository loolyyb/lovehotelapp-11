
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useLogger } from "@/hooks/useLogger";
import { supabase } from "@/integrations/supabase/client"; 
import { useToast } from "@/hooks/use-toast";
import { ConnectionErrorState } from "@/components/messages/ConnectionErrorState";
import { MessagesContainer } from "@/components/messages/MessagesContainer";
import { useConnectionStatus } from "@/hooks/messages/useConnectionStatus";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const location = useLocation();
  const logger = useLogger("Messages");
  const previousConversationRef = useRef<string | null>(null);
  const { toast } = useToast();
  const mountedRef = useRef(true);
  const refreshAttemptRef = useRef(0);

  const { 
    isCheckingConnection, 
    connectionError, 
    isNetworkError, 
    setIsNetworkError, 
    checkConnectionStatus 
  } = useConnectionStatus();

  useEffect(() => {
    logger.info("Messages page mounted");
    
    mountedRef.current = true;
    
    // Check connection status when component mounts
    checkConnectionStatus();
    
    if (location.state?.conversationId) {
      logger.info("Setting conversation from location state", { conversationId: location.state.conversationId });
      setSelectedConversation(location.state.conversationId);
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [location.state, logger, checkConnectionStatus]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    // If clicking on the already selected conversation, do nothing
    if (selectedConversation === conversationId) {
      logger.info("Conversation already selected, ignoring", { conversationId });
      return;
    }
    
    // Remember previous value for logging
    previousConversationRef.current = selectedConversation;
    
    logger.info("Changing selected conversation", { 
      from: previousConversationRef.current, 
      to: conversationId 
    });
    
    // Update the selected conversation
    setSelectedConversation(conversationId);
  }, [selectedConversation, logger]);

  const handleBack = useCallback(() => {
    logger.info("Navigating back from conversation view");
    setSelectedConversation(null);
  }, [logger]);

  const handleRefreshConversations = useCallback(() => {
    logger.info("Manually refreshing conversations");
    
    // Avoid multiple rapid refresh attempts
    refreshAttemptRef.current += 1;
    const currentAttempt = refreshAttemptRef.current;
    
    // Check connection status first
    checkConnectionStatus().then(() => {
      // If connection is OK but there was a network error before
      if (!connectionError && isNetworkError && mountedRef.current && currentAttempt === refreshAttemptRef.current) {
        setIsNetworkError(false);
        
        // If we had a network error that's now resolved, reload the page
        // This is a last resort approach that ensures all connections are reestablished
        window.location.reload();
        return;
      }
      
      // Normal refresh flow if there's no connection error
      if (!connectionError && mountedRef.current && currentAttempt === refreshAttemptRef.current) {
        // If we have a profile, refresh conversations
        supabase.auth.getUser().then(({ data, error }) => {
          if (error || !data.user) {
            throw error || new Error("No authenticated user");
          }
          
          // Show success toast
          toast({
            title: "Actualisation réussie",
            description: "Vos conversations ont été actualisées"
          });
        }).catch(error => {
          logger.error("Error getting user during refresh", { error });
          
          if (mountedRef.current) {
            toast({
              variant: "destructive",
              title: "Erreur de connexion",
              description: "Impossible de récupérer votre profil. Veuillez réessayer."
            });
          }
        });
      }
    });
  }, [connectionError, isNetworkError, logger, toast, checkConnectionStatus, setIsNetworkError]);

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
