
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
  const mountedRef = useRef(true);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const checkConnectionStatus = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (checkInProgressRef.current) {
      logger.info("Connection check already in progress, skipping");
      return;
    }
    
    // Aggressive throttling - check at most once every 10 seconds
    const now = Date.now();
    if (now - lastCheckTimeRef.current < 10000) {
      logger.info("Throttling connection check, too soon after previous check", {
        msSinceLastCheck: now - lastCheckTimeRef.current
      });
      return;
    }
    
    checkInProgressRef.current = true;
    lastCheckTimeRef.current = now;
    
    if (mountedRef.current) {
      setIsCheckingConnection(true);
      setConnectionError(null);
    }
    
    try {
      // Try to get the user to check authentication
      const { data, error: authError } = await supabase.auth.getUser();
      
      // Don't update state if component unmounted
      if (!mountedRef.current) return;
      
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
      
      // Check if we can query the database, but don't do this on every check
      // Only do a full database check if we had a previous network error
      if (isNetworkError) {
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
      }
      
      // If we get here, connection is good
      setIsNetworkError(false);
      setConnectionError(null);
      logger.info("Connection check successful");
    } catch (error: any) {
      // Don't update state if component unmounted
      if (!mountedRef.current) return;
      
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
      if (mountedRef.current) {
        setIsCheckingConnection(false);
      }
      
      // Delay clearing the flag to prevent immediate consecutive checks
      setTimeout(() => {
        checkInProgressRef.current = false;
      }, 1000);
    }
  }, [logger, isNetworkError]);

  // Run initial check on mount, but only once
  useEffect(() => {
    if (mountedRef.current) {
      checkConnectionStatus();
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [checkConnectionStatus]);

  return {
    isCheckingConnection,
    connectionError,
    isNetworkError,
    setIsNetworkError,
    checkConnectionStatus
  };
};
