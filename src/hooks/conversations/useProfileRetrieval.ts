
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";

interface UseProfileRetrievalProps {
  setCurrentProfileId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useProfileRetrieval = ({
  setCurrentProfileId
}: UseProfileRetrievalProps) => {
  const getCurrentUserProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        logger.error("Auth error getting current user", { 
          error: authError,
          component: "useProfileRetrieval" 
        });
        throw authError;
      }
      
      if (!user) {
        logger.error("No authenticated user found", {
          component: "useProfileRetrieval"
        });
        return null;
      }

      logger.info("User authenticated", { 
        userId: user.id,
        component: "useProfileRetrieval" 
      });

      // Get user profile ID from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        logger.error("Error fetching user profile", { 
          error: profileError,
          userId: user.id,
          component: "useProfileRetrieval" 
        });
        throw profileError;
      }

      if (!profile) {
        logger.error("User profile not found", { 
          userId: user.id,
          component: "useProfileRetrieval" 
        });
        return null;
      }

      logger.info("Found user profile", { 
        profileId: profile.id,
        userId: user.id,
        component: "useProfileRetrieval" 
      });
      
      setCurrentProfileId(profile.id);
      return profile.id;
    } catch (error: any) {
      logger.error("Error in getCurrentUserProfile", { 
        error: error.message,
        stack: error.stack,
        component: "useProfileRetrieval" 
      });
      AlertService.captureException(error, { 
        component: "useProfileRetrieval"
      });
      return null;
    }
  };

  return { getCurrentUserProfile };
};
