import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { useToast } from "@/hooks/use-toast";
import { useProfileState } from "@/hooks/useProfileState";

export function useConversationAuth() {
  const [authChecked, setAuthChecked] = useState(false);
  const [hasAuthError, setHasAuthError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const logger = useLogger("useConversationAuth");
  const { toast } = useToast();
  const { profileId, isInitialized, refreshProfile, isLoading: profileLoading } = useProfileState();

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      logger.info("Checking authentication status", {
        profileLoading,
        profileInitialized: isInitialized,
        hasProfileId: !!profileId
      });
      
      // Check if we already have profile from centralized state
      if (isInitialized && profileId) {
        logger.info("Using profile from centralized state", { profileId });
        setHasAuthError(false);
        setAuthChecked(true);
        return true;
      }

      // If profile is still loading, wait for it
      if (profileLoading) {
        logger.info("Profile is still loading, waiting");
        return false;
      }
      
      // If profile is initialized but we don't have an ID, there's an auth issue
      if (isInitialized && !profileId) {
        logger.warn("Profile initialized but no ID found");
        setHasAuthError(true);
        setAuthChecked(true);
        return false;
      }
      
      // As a fallback, check session directly
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error("Session check error", { error });
        setHasAuthError(true);
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Votre session a expiré. Veuillez vous reconnecter."
        });
        setAuthChecked(true);
        return false;
      }
      
      if (!session) {
        logger.warn("No active session found");
        setHasAuthError(true);
        toast({
          variant: "destructive",
          title: "Non connecté",
          description: "Veuillez vous connecter pour accéder à vos messages."
        });
        setAuthChecked(true);
        return false;
      }
      
      logger.info("Session found, but profile not loaded yet");
      // We have a session but no profile, try refreshing profile
      await refreshProfile();
      
      // Rest of the authentication logic is handled by useProfileState
      setHasAuthError(!profileId);
      setAuthChecked(true);
      return !!profileId;
    } catch (e) {
      logger.error("Error checking auth status", { error: e });
      setHasAuthError(true);
      setAuthChecked(true);
      return false;
    }
  }, [logger, toast, profileId, isInitialized, refreshProfile, profileLoading]);

  // Retry authentication and profile loading
  const retryAuth = useCallback(async () => {
    logger.info("Retrying authentication");
    setIsRetrying(true);
    
    try {
      // Refresh profile from centralized state
      await refreshProfile();
      
      // If we now have a profile, auth is successful
      if (profileId) {
        setHasAuthError(false);
        toast({
          title: "Connexion réussie",
          description: "Votre session a été restaurée."
        });
        return true;
      } else {
        // Check session as a fallback
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // We have a user but no profile, which is unusual
          toast({
            variant: "destructive",
            title: "Erreur de profil",
            description: "Impossible de récupérer votre profil. Veuillez réessayer."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Non connecté",
            description: "Vous n'êtes pas connecté. Veuillez vous reconnecter."
          });
          setHasAuthError(true);
        }
        return false;
      }
    } catch (error) {
      logger.error("Error in retry auth", { error });
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Problème de connexion au serveur. Veuillez réessayer plus tard."
      });
      return false;
    } finally {
      setIsRetrying(false);
    }
  }, [refreshProfile, profileId, logger, toast]);

  // Initialize auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Re-check auth when profile state changes
  useEffect(() => {
    if (isInitialized) {
      logger.info("Profile state changed, rechecking auth", { 
        hasProfileId: !!profileId, 
        isInitialized 
      });
      setHasAuthError(!profileId);
      setAuthChecked(true);
    }
  }, [profileId, isInitialized, logger]);

  return {
    authChecked,
    hasAuthError,
    isRetrying,
    checkAuth,
    retryAuth
  };
}
