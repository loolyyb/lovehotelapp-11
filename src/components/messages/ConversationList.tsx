
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
  const [loadingTimeExceeded, setLoadingTimeExceeded] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);

  // Add detailed logging for state changes
  useEffect(() => {
    logger.info("ConversationList main state update", {
      hasConversations: conversations.length > 0,
      conversationCount: conversations.length,
      hasProfileId: !!currentProfileId,
      isLoading,
      isRefreshing,
      hasAuthError,
      authChecked,
      error: error || null,
      loadingTimeExceeded,
      selectedId: selectedConversationId
    });
  }, [
    conversations.length,
    currentProfileId,
    isLoading,
    isRefreshing,
    hasAuthError,
    authChecked,
    error,
    loadingTimeExceeded,
    selectedConversationId,
    logger
  ]);

  // Faster loading timeout for better UX
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isLoading && !loadingTimeExceeded) {
      logger.info("Starting loading timeout", {
        hasConversations: conversations.length > 0,
        currentProfileId
      });
      
      // Two-tier timeout system
      // 1. Show loading spinner for 8 seconds
      // 2. If we have conversations but still loading other data, show them anyway
      timeoutId = setTimeout(() => {
        if (conversations.length > 0) {
          logger.info("Loading timeout exceeded but have conversations, showing them", {
            count: conversations.length,
            currentProfileId
          });
        } else {
          logger.warn("Loading timeout exceeded, forcing UI update", {
            hasConversations: conversations.length > 0,
            currentProfileId
          });
        }
        setLoadingTimeExceeded(true);
      }, 8000); // 8 second timeout (reduced from 15s)
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, loadingTimeExceeded, conversations.length, currentProfileId, logger]);

  // Enhanced retry logic
  const handleRetry = useCallback(async () => {
    logger.info("Manually retrying conversation fetch");
    setIsRefreshingManually(true);
    setRetryAttempt(prev => prev + 1);
    
    try {
      // First try to fix auth if needed
      if (hasAuthError) {
        logger.info("Auth error detected, attempting to recover");
        const authSuccess = await retryAuth();
        if (!authSuccess) {
          logger.warn("Auth retry failed");
          setIsRefreshingManually(false);
          
          toast({
            variant: "destructive",
            title: "Erreur d'authentification",
            description: "Veuillez vous reconnecter pour accéder à vos messages."
          });
          return;
        }
        logger.info("Auth retry successful");
      }
      
      // Then force refresh conversations to bypass cache
      await refreshConversations(false);
      toast({
        title: "Rafraîchissement réussi",
        description: "Vos conversations ont été mises à jour."
      });
    } catch (error: any) {
      logger.error("Error in retry", { error });
      // Notify parent about network error
      if (onNetworkError) {
        onNetworkError();
      }
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Problème lors du chargement de vos conversations. Veuillez réessayer plus tard."
      });
    } finally {
      setIsRefreshingManually(false);
    }
  }, [refreshConversations, retryAuth, hasAuthError, logger, toast, onNetworkError]);

  // Memoized handlers to prevent recreating functions on each render
  const handleLogin = useCallback(() => {
    logger.info("Redirecting to login page");
    navigate("/login", { state: { returnUrl: "/messages" } });
  }, [navigate, logger]);

  const handleRefresh = useCallback(() => {
    logger.info("Manual refresh requested");
    // Force fresh fetch on manual refresh - bypass cache completely
    refreshConversations(false); 
  }, [refreshConversations, logger]);

  // Show conversations more eagerly to improve UX
  const shouldShowConversations = useMemo(() => {
    // Show if we have conversations and loading has exceeded timeout
    return conversations.length > 0 && (loadingTimeExceeded || !isLoading);
  }, [conversations.length, loadingTimeExceeded, isLoading]);

  // Authentication error state
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

  // Loading state with faster timeout
  if ((!authChecked || isLoading) && !loadingTimeExceeded && !shouldShowConversations) {
    logger.info("Showing loading state", { 
      authChecked, 
      isLoading, 
      hasProfile: !!currentProfileId, 
      timeout: loadingTimeExceeded,
      retryAttempt,
      conversationCount: conversations.length
    });
    return <LoadingState />;
  }

  // Error state - only show if no conversations available
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

  // Empty conversations state
  if (currentProfileId && (!conversations || conversations.length === 0)) {
    logger.info("Showing empty conversations state");
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
        isRefreshing={isRefreshing || isRefreshingManually}
        handleRefresh={handleRefresh}
      />
      {shouldShowConversations && (
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
