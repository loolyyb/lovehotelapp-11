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
  const { profileId, isInitialized, refreshProfile } = useProfileState();

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      logger.info("Checking authentication status");
      
      // Check if we already have profile from centralized state
      if (isInitialized && profileId) {
        logger.info("Using profile from centralized state", { profileId });
        setHasAuthError(false);
        setAuthChecked(true);
        return true;
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error("Session check error", { error });
        setHasAuthError(true);
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Votre session a expiré. Veuillez vous reconnecter."
        });
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
        return false;
      }
      
      // Rest of the authentication logic is handled by useProfileState
      setHasAuthError(false);
      return true;
    } catch (e) {
      logger.error("Error checking auth status", { error: e });
      setHasAuthError(true);
      return false;
    } finally {
      setAuthChecked(true);
    }
  }, [logger, toast, profileId, isInitialized]);

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

  return {
    authChecked,
    hasAuthError,
    isRetrying,
    checkAuth,
    retryAuth
  };
}
