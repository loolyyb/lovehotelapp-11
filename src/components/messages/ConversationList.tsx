
import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLogger } from "@/hooks/useLogger";
import { useToast } from "@/hooks/use-toast";
import { useStableConversations } from "@/hooks/conversations/useStableConversations";
import { useConversationAuth } from "@/hooks/conversations/useConversationAuth";
import { LoadingState } from "./LoadingState";

// Import our components
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

  // Log state changes - helpful for debugging
  useEffect(() => {
    logger.info("ConversationList state update", { 
      conversationsCount: conversations.length,
      conversationIds: conversations.map(c => c.id),
      currentProfileId,
      authChecked,
      hasAuthError,
      isLoading,
      isRefreshing
    });
  }, [conversations, currentProfileId, authChecked, hasAuthError, isLoading, isRefreshing, logger]);

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
        logger.info("Auth error detected, attempting to recover");
        const authSuccess = await retryAuth();
        if (!authSuccess) {
          logger.warn("Auth retry failed");
          setIsRefreshingManually(false);
          return;
        }
        logger.info("Auth retry successful");
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
    logger.info("Manual refresh requested");
    refreshConversations(false); // Force fresh fetch on manual refresh
  }, [refreshConversations, logger]);

  // Authentication error state - show this when we've confirmed there's an auth issue
  if (authChecked && hasAuthError) {
    logger.info("Showing auth required state due to auth error");
    return (
      <AuthRequiredState
        isAuthRetrying={isAuthRetrying}
        isRefreshingManually={isRefreshingManually}
        handleLogin={handleLogin}
        handleRetry={handleRetry}
      />
    );
  }

  // Loading state - show when we're still checking auth or loading profile
  if (!authChecked || isLoading) {
    logger.info("Showing loading state", { authChecked, isLoading, hasProfile: !!currentProfileId });
    return <LoadingState />;
  }

  // Error state - show when we have an error but auth is okay
  if (error && conversations.length === 0) {
    logger.info("Showing error state", { error });
    return (
      <ErrorState
        error={error}
        isRefreshingManually={isRefreshingManually}
        handleRetry={handleRetry}
      />
    );
  }

  // Empty conversations state - show when profile is loaded but no conversations exist
  if (currentProfileId && (!conversations || conversations.length === 0)) {
    logger.info("Showing empty conversations state");
    return (
      <EmptyConversationsState
        isRefreshingManually={isRefreshingManually}
        handleRetry={handleRetry}
      />
    );
  }

  // Render the conversation list only when we have profile ID and conversations
  return (
    <div className="h-full flex flex-col">
      <ConversationListHeader
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
      />
      {conversations.length > 0 && (
        <ConversationItems
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          currentProfileId={currentProfileId}
          onSelectConversation={onSelectConversation}
        />
      )}
    </div>
  );
}
