
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

  const { 
    isCheckingConnection, 
    connectionError, 
    isNetworkError, 
    setIsNetworkError, 
    checkConnectionStatus 
  } = useConnectionStatus();

  useEffect(() => {
    logger.info("Messages page mounted");
    
    // Check connection status when component mounts
    checkConnectionStatus();
    
    if (location.state?.conversationId) {
      logger.info("Setting conversation from location state", { conversationId: location.state.conversationId });
      setSelectedConversation(location.state.conversationId);
    }
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
    checkConnectionStatus().then(() => {
      if (!connectionError) {
        // If we have a profile, refresh conversations
        supabase.auth.getUser().then(({ data }) => {
          if (data.user) {
            // Force refresh conversations
            logger.info("Forcing conversation refresh", { userId: data.user.id });
            // Force page reload to refresh all components and connections
            if (isNetworkError) {
              window.location.reload();
            }
          }
        }).catch(error => {
          logger.error("Error getting user during refresh", { error });
          toast({
            variant: "destructive",
            title: "Erreur de connexion",
            description: "Impossible de récupérer votre profil. Veuillez réessayer."
          });
        });
      }
    });
  }, [connectionError, isNetworkError, logger, toast, checkConnectionStatus]);

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
