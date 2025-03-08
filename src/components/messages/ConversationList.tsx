
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

  // Log profile status - helpful for debugging
  useEffect(() => {
    logger.info("Rendering conversation list", { 
      conversationsCount: conversations.length,
      currentUserProfileId: currentProfileId
    });
  }, [conversations.length, currentProfileId, logger]);

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

  // Loading state - only show when profile initialization is in progress
  if (isLoading && !currentProfileId) {
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

  // Empty conversations state - only show when profile is loaded
  if (currentProfileId && (!conversations || conversations.length === 0)) {
    return (
      <EmptyConversationsState
        isRefreshingManually={isRefreshingManually}
        handleRetry={handleRetry}
      />
    );
  }

  // If we still don't have a profile ID but we're not in a loading state
  if (!currentProfileId && !isLoading) {
    return (
      <AuthRequiredState
        isAuthRetrying={false}
        isRefreshingManually={false}
        handleLogin={handleLogin}
        handleRetry={handleRetry}
      />
    );
  }

  // Render the conversation list only when we have profile ID
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
