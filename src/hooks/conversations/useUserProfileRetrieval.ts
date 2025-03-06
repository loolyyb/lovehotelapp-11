
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { AlertService } from "@/services/AlertService";
import { useToast } from "@/hooks/use-toast";

export const useUserProfileRetrieval = () => {
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logger = useLogger("useUserProfileRetrieval");
  const { toast } = useToast();
  
  const getUserProfile = useCallback(async (retryCount = 0, maxRetries = 5) => {
    try {
      setIsLoading(true);
      logger.info("Fetching user profile");
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        logger.error("Auth error getting user", { 
          error: authError,
          component: "useUserProfileRetrieval" 
        });
        throw new Error("Erreur d'authentification. Veuillez vous reconnecter.");
      }
      
      if (!user) {
        logger.error("No authenticated user found", { component: "useUserProfileRetrieval" });
        setError("Vous devez être connecté pour accéder aux messages");
        return null;
      }

      logger.info("User authenticated", { 
        userId: user.id,
        email: user.email,
        component: "useUserProfileRetrieval" 
      });

      // Get user's profile id
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!userProfile) {
        logger.warn("No profile found for user, attempting to create one", { 
          userId: user.id,
          component: "useUserProfileRetrieval" 
        });
        
        // Try to create a profile if none exists
        try {
          const newProfileId = crypto.randomUUID();
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: newProfileId,
              user_id: user.id,
              full_name: user.email?.split('@')[0] || 'Nouvel utilisateur',
              role: 'user'
            }]);
            
          if (insertError) {
            throw insertError;
          }
          
          logger.info("Created new profile for user", {
            userId: user.id,
            profileId: newProfileId,
            component: "useUserProfileRetrieval"
          });
          
          setCurrentProfileId(newProfileId);
          return newProfileId;
        } catch (createError) {
          logger.error("Failed to create profile", {
            error: createError,
            userId: user.id,
            component: "useUserProfileRetrieval"
          });
          throw new Error("Impossible de créer un profil. Veuillez contacter le support.");
        }
      }

      logger.info("User profile found", { 
        profileId: userProfile.id,
        username: userProfile.username,
        fullName: userProfile.full_name,
        component: "useUserProfileRetrieval" 
      });

      setCurrentProfileId(userProfile.id);
      return userProfile.id;
    } catch (error: any) {
      logger.error("Error retrieving user profile", { 
        error: error.message, 
        stack: error.stack,
        component: "useUserProfileRetrieval",
        retryCount
      });
      
      if (retryCount < maxRetries) {
        logger.info(`Retrying profile fetch (${retryCount + 1}/${maxRetries})`, { 
          component: "useUserProfileRetrieval"
        });
        
        // Wait with exponential backoff before retrying
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 10000)));
        return getUserProfile(retryCount + 1, maxRetries);
      }
      
      AlertService.captureException(error);
      setError(error.message || "Erreur lors de la récupération du profil");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [logger, toast]);

  return {
    currentProfileId,
    setCurrentProfileId,
    isLoading,
    error,
    getUserProfile
  };
};
