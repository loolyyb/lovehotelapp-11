
import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";

export const useConnectionStatus = () => {
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const logger = useLogger("useConnectionStatus");
  const lastCheckTimeRef = useRef(0);
  const checkInProgressRef = useRef(false);

  const checkConnectionStatus = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (checkInProgressRef.current) {
      logger.info("Connection check already in progress, skipping");
      return;
    }
    
    // Throttle checks to no more than once every 5 seconds
    const now = Date.now();
    if (now - lastCheckTimeRef.current < 5000) {
      logger.info("Throttling connection check, too soon after previous check", {
        msSinceLastCheck: now - lastCheckTimeRef.current
      });
      return;
    }
    
    checkInProgressRef.current = true;
    setIsCheckingConnection(true);
    setConnectionError(null);
    
    try {
      lastCheckTimeRef.current = now;
      
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
      
      // If we get here, connection is good
      setIsNetworkError(false);
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
      checkInProgressRef.current = false;
    }
  }, [logger]);

  // Run initial check on mount, but only once
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  return {
    isCheckingConnection,
    connectionError,
    isNetworkError,
    setIsNetworkError,
    checkConnectionStatus
  };
};
