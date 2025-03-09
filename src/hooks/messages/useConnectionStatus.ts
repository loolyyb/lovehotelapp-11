
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";

export function useConnectionStatus() {
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const logger = useLogger("useConnectionStatus");

  // Function to check connection status
  const checkConnectionStatus = useCallback(async () => {
    if (isCheckingConnection) return;
    
    setIsCheckingConnection(true);
    
    try {
      logger.info("Checking connection status");
      
      // Try to make a lightweight request to Supabase
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('profiles')
        .select('count(*)', { count: 'exact', head: true });
      
      const requestTime = Date.now() - startTime;
      
      if (error) {
        logger.error("Connection check failed", { error, requestTime });
        setConnectionError(error);
        // Only set network error if it looks like a network-related issue
        if (error.message.includes('fetch') || error.message.includes('network') || requestTime < 10) {
          setIsNetworkError(true);
        }
        return false;
      }
      
      // Successfully connected
      logger.info("Connection check successful", { requestTime });
      setConnectionError(null);
      setIsNetworkError(false);
      return true;
    } catch (error: any) {
      logger.error("Error checking connection", { error });
      setConnectionError(error);
      
      // Likely a network error if we get here
      setIsNetworkError(true);
      return false;
    } finally {
      setIsCheckingConnection(false);
    }
  }, [isCheckingConnection, logger]);

  return {
    isCheckingConnection,
    connectionError,
    isNetworkError,
    setIsNetworkError,
    checkConnectionStatus
  };
}
