
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
        
        toast({
          title: "Actualisation réussie",
          description: "Vos conversations ont été actualisées"
        });
      }
    } catch (error) {
      logger.error("Error refreshing conversations:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'actualiser les conversations."
      });
    }
  }, [checkConnectionStatus, connectionError, isNetworkError, setIsNetworkError, logger, toast]);

  // If we have a network error, show the connection error state
  if (isNetworkError && !isCheckingConnection) {
    return (
      <div className="container h-screen flex flex-col p-4">
        <ConnectionErrorState 
          onRetry={handleRefreshConversations} 
          isRetrying={isCheckingConnection} 
        />
      </div>
    );
  }

  return (
    <div className="container h-screen flex flex-col p-4">
      <MessagesContainer
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        onBack={handleBack}
        onNetworkError={() => setIsNetworkError(true)}
        onRefresh={handleRefreshConversations}
        isRefreshing={isCheckingConnection}
        isNetworkError={isNetworkError}
      />
    </div>
  );
}
