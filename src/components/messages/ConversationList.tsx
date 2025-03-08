
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLogger } from "@/hooks/useLogger";
import { useToast } from "@/hooks/use-toast";
import { useStableConversations } from "@/hooks/conversations/useStableConversations";
import { useConversationAuth } from "@/hooks/conversations/useConversationAuth";
import { LoadingState } from "./LoadingState";

// Import our new components
import { AuthRequiredState } from "./conversation-list/AuthRequiredState";
import { ErrorState } from "./conversation-list/ErrorState";
import { EmptyConversationsState } from "./conversation-list/EmptyConversationsState";
import { ConversationListHeader } from "./conversation-list/ConversationListHeader";
import { ConversationItems } from "./conversation-list/ConversationItems";

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
  onNetworkError?: () => void;
}

export function ConversationList({ 
  onSelectConversation, 
  selectedConversationId,
  onNetworkError
}: ConversationListProps) {
  const logger = useLogger("ConversationList");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    authChecked,
    hasAuthError,
    isRetrying: isAuthRetrying,
    retryAuth
  } = useConversationAuth();
  
  const {
    conversations,
    isLoading,
    isRefreshing,
    error,
    refreshConversations,
    currentProfileId
  } = useStableConversations();

  const [isRefreshingManually, setIsRefreshingManually] = useState(false);

  // Memoized handlers to prevent recreating functions on each render
  const handleLogin = useCallback(() => {
    logger.info("Redirecting to login page");
    navigate("/login", { state: { returnUrl: "/messages" } });
  }, [navigate, logger]);

  const handleRetry = useCallback(async () => {
    logger.info("Manually retrying conversation fetch");
    setIsRefreshingManually(true);
    
    try {
      // First try to fix auth if needed
      if (hasAuthError) {
        const authSuccess = await retryAuth();
        if (!authSuccess) {
          setIsRefreshingManually(false);
          return;
        }
      }
      
      // Then refresh conversations
      await refreshConversations(false); // Force fresh fetch
      toast({
        title: "Rafraîchissement réussi",
        description: "Vos conversations ont été mises à jour."
      });
    } catch (error: any) {
      logger.error("Error in retry", { error });
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Problème de connexion au serveur. Veuillez réessayer plus tard."
      });
    } finally {
      setIsRefreshingManually(false);
    }
  }, [refreshConversations, retryAuth, hasAuthError, logger, toast]);

  const handleRefresh = useCallback(() => {
    refreshConversations(false); // Force fresh fetch on manual refresh
  }, [refreshConversations]);

  // Authentication error state
  if (hasAuthError) {
    return (
      <AuthRequiredState
        isAuthRetrying={isAuthRetrying}
        isRefreshingManually={isRefreshingManually}
        handleLogin={handleLogin}
        handleRetry={handleRetry}
      />
    );
  }

  // Loading state
  if (isLoading && conversations.length === 0) {
    return <LoadingState />;
  }

  // Error state
  if (error && conversations.length === 0) {
    return (
      <ErrorState
        error={error}
        isRefreshingManually={isRefreshingManually}
        handleRetry={handleRetry}
      />
    );
  }

  logger.info("Rendering conversation list", { 
    conversationsCount: conversations.length,
    currentUserProfileId: currentProfileId
  });

  // Empty conversations state
  if (!conversations || conversations.length === 0) {
    return (
      <EmptyConversationsState
        isRefreshingManually={isRefreshingManually}
        handleRetry={handleRetry}
      />
    );
  }

  // Render the conversation list
  return (
    <div className="h-full flex flex-col">
      <ConversationListHeader
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
      />
      <ConversationItems
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        currentProfileId={currentProfileId}
        onSelectConversation={onSelectConversation}
      />
    </div>
  );
}
