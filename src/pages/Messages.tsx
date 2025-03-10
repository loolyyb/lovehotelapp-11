
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
import { MessageCache } from "@/hooks/messages/cache";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const location = useLocation();
  const logger = useLogger("Messages");
  const previousConversationRef = useRef<string | null>(null);
  const { toast } = useToast();
  const mountedRef = useRef(true);
  const refreshAttemptRef = useRef(0);
  const lastVisibleTimeRef = useRef(Date.now());
  const conversationsRefreshedRef = useRef(false);
  const initRetryAttemptRef = useRef(0);

  // Track page visibility
  const { isVisible, wasHidden, setWasHidden } = usePageVisibility();
  
  // Access central profile state
  const { profileId, refreshProfile, isInitialized, isLoading: profileLoading } = useProfileState();

  const { 
    isCheckingConnection, 
    connectionError, 
    isNetworkError, 
    setIsNetworkError, 
    checkConnectionStatus 
  } = useConnectionStatus();

  // Debug mount information
  useEffect(() => {
    logger.info("Messages page mounted", {
      locationState: location.state,
      hasProfile: !!profileId,
      profileInitialized: isInitialized,
      profileLoading
    });
    
    mountedRef.current = true;
    
    // Check connection status with retry logic
    const checkConnection = async () => {
      try {
        await checkConnectionStatus();
      } catch (error) {
        // If we fail to check connection, retry up to 3 times with increasing delays
        if (initRetryAttemptRef.current < 3) {
          const delay = Math.pow(2, initRetryAttemptRef.current) * 1000;
          logger.info(`Retrying connection check in ${delay}ms (attempt ${initRetryAttemptRef.current + 1}/3)`);
          
          initRetryAttemptRef.current++;
          setTimeout(checkConnection, delay);
        }
      }
    };
    
    checkConnection();
    
    if (location.state?.conversationId) {
      logger.info("Setting conversation from location state", { conversationId: location.state.conversationId });
      setSelectedConversation(location.state.conversationId);
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [location.state, logger, checkConnectionStatus, profileId, isInitialized, profileLoading]);

  // Handle visibility changes - refresh data when returning to the page
  useEffect(() => {
    if (isVisible && wasHidden) {
      const timeSinceLastVisible = Date.now() - lastVisibleTimeRef.current;
      logger.info("Page became visible again after being hidden", { 
        timeSinceLastVisible: `${Math.round(timeSinceLastVisible / 1000)}s`,
        selectedConversation,
        profileId
      });
      
      // Only force refresh if it's been hidden for more than 10 seconds
      if (timeSinceLastVisible > 10000) {
        logger.info("Tab was hidden for a significant time, refreshing state");
        
        // Refresh profile to ensure we have the latest state
        refreshProfile().then(() => {
          // Reset the permission verification state for conversations
          if (selectedConversation) {
            logger.info("Clearing message cache for active conversation after tab hidden", {
              conversationId: selectedConversation
            });
            MessageCache.clearConversation(selectedConversation);
          }
          
          // Force a refresh of conversations
          conversationsRefreshedRef.current = false;
          handleRefreshConversations(true);
          
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
  }, [isVisible, wasHidden, logger, refreshProfile, setWasHidden, selectedConversation, profileId]);

  // Monitor profile state
  useEffect(() => {
    logger.info("Profile state updated in Messages page", {
      profileId,
      isInitialized,
      profileLoading
    });
    
    // If profile initialized but no ID, might need to show login
    if (isInitialized && !profileLoading && !profileId) {
      logger.warn("Profile initialized but no ID available - user might need to log in");
    }
  }, [profileId, isInitialized, profileLoading, logger]);

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

  const handleRefreshConversations = useCallback(async (force = false) => {
    logger.info("Manually refreshing conversations", { force });
    
    // Skip if we've already refreshed and this isn't a forced refresh
    if (conversationsRefreshedRef.current && !force) {
      logger.info("Skipping refresh as conversations were already refreshed");
      return;
    }
    
    refreshAttemptRef.current += 1;
    const currentAttempt = refreshAttemptRef.current;
    
    try {
      await checkConnectionStatus();
      
      if (!connectionError && isNetworkError && mountedRef.current && currentAttempt === refreshAttemptRef.current) {
        setIsNetworkError(false);
        logger.info("Network recovered, reloading page");
        window.location.reload();
        return;
      }
      
      // Try to get the current session
      if (!connectionError && mountedRef.current && currentAttempt === refreshAttemptRef.current) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          logger.error("Auth error during refresh", { error: authError });
          
          // Retry authentication if it might be a temporary issue
          if (authError.message.includes('JWT expired') || authError.message.includes('token')) {
            logger.info("JWT issue detected, refreshing session");
            
            const { data: session, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              logger.error("Failed to refresh session", { error: refreshError });
              throw refreshError;
            }
            
            if (!session.session) {
              logger.warn("No valid session after refresh");
              throw new Error("No valid session available");
            }
            
            // Successfully refreshed session, continue
            logger.info("Session refreshed successfully");
          } else {
            throw authError;
          }
        } else if (!user) {
          logger.warn("No authenticated user during refresh");
          throw new Error("No authenticated user");
        }
        
        // If we have a valid user, don't show a toast for automatic refreshes due to tab visibility
        if (!wasHidden && !force) {
          toast({
            title: "Actualisation réussie",
            description: "Vos conversations ont été actualisées"
          });
        }
        
        // Mark conversations as refreshed
        conversationsRefreshedRef.current = true;
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
