
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLogger } from "@/hooks/useLogger";
import { AlertService } from "@/services/AlertService";

interface UseMessageInitializerProps {
  conversationId: string;
  fetchingRef: React.MutableRefObject<boolean>;
  firstLoad: React.MutableRefObject<boolean>;
  setCurrentProfileId: (profileId: string | null) => void;
  setIsAuthChecked: (isChecked: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsError: (isError: boolean) => void;
  getCurrentUser: () => Promise<void>;
}

/**
 * Hook for initializing message view authentication state
 */
export const useMessageInitializer = ({
  conversationId,
  fetchingRef,
  firstLoad,
  setCurrentProfileId,
  setIsAuthChecked,
  setIsLoading,
  setIsError,
  getCurrentUser
}: UseMessageInitializerProps) => {
  const logger = useLogger("useMessageInitializer");
  const { toast } = useToast();

  // Initialize profile setter function 
  const memoizedProfileSetter = useCallback((profileId: string | null) => {
    setCurrentProfileId(profileId);
    if (profileId) {
      logger.info("Set current profile ID", { profileId });
    }
  }, [setCurrentProfileId, logger]);

  // Initial profile and auth check
  useEffect(() => {
    let mounted = true;
    setIsError(false);
    
    // Check auth session
    const checkAuth = async () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      
      try {
        // Check auth session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          logger.error("No active session", { component: "MessageInitializer" });
          if (mounted) {
            setIsAuthChecked(true);
            setIsLoading(false);
            toast({
              variant: "destructive",
              title: "Session expirée",
              description: "Veuillez vous reconnecter pour accéder à vos messages"
            });
          }
          return;
        }

        logger.info("Auth session valid, initializing conversation", { 
          userId: session.user.id,
          conversationId 
        });
        
        if (mounted) {
          await getCurrentUser();
          setIsAuthChecked(true);
        }
      } catch (error: any) {
        logger.error("Error checking authentication", { 
          error: error.message,
          stack: error.stack
        });
        
        if (mounted) {
          setIsAuthChecked(true);
          setIsError(true);
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Erreur d'authentification",
            description: "Impossible de vérifier votre identité. Veuillez vous reconnecter."
          });
        }
      } finally {
        if (mounted) {
          firstLoad.current = false;
          fetchingRef.current = false;
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [conversationId, getCurrentUser, setIsAuthChecked, setIsError, setIsLoading, firstLoad, fetchingRef, logger, toast]);

  return { memoizedProfileSetter };
};
