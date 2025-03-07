
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";

export const useConnectionStatus = () => {
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const logger = useLogger("useConnectionStatus");

  const checkConnectionStatus = useCallback(async () => {
    setIsCheckingConnection(true);
    setConnectionError(null);
    setIsNetworkError(false);
    
    try {
      // Try to get the user to check authentication
      const { data, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        logger.error("Authentication error", { error: authError });
        setConnectionError("Erreur d'authentification. Veuillez vous reconnecter.");
        return;
      }
      
      if (!data.user) {
        logger.error("No authenticated user");
        setConnectionError("Vous n'êtes pas connecté. Veuillez vous connecter pour accéder à vos messages.");
        return;
      }
      
      // Check if we can query the database
      const { error: queryError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle();
        
      if (queryError) {
        logger.error("Database connection error", { error: queryError });
        
        // Check if it's a network-related error
        if (queryError.message?.includes('Failed to fetch') || 
            queryError.message?.includes('NetworkError') ||
            queryError.message?.includes('network') ||
            queryError.code === 'NETWORK_ERROR') {
          setIsNetworkError(true);
          setConnectionError("Problème de connexion au réseau. Veuillez vérifier votre connexion Internet.");
        } else {
          setConnectionError("Problème de connexion à la base de données. Veuillez réessayer.");
        }
        return;
      }
      
      // Connection is good
      logger.info("Connection check successful");
    } catch (error: any) {
      logger.error("Connection check failed", { error });
      
      // Check if it's a network-related error
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('NetworkError') ||
          error.message?.includes('network') ||
          error.code === 'NETWORK_ERROR') {
        setIsNetworkError(true);
      }
      
      setConnectionError("Erreur de connexion au serveur. Veuillez vérifier votre connexion Internet.");
    } finally {
      setIsCheckingConnection(false);
    }
  }, [logger]);

  return {
    isCheckingConnection,
    connectionError,
    isNetworkError,
    setIsNetworkError,
    checkConnectionStatus
  };
};
