
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";

/**
 * Get the user_id associated with a profile ID
 * @param profileId The profile ID to look up
 * @returns Object with either data (the user_id) or an error
 */
export const getTargetUserId = async (profileId: string) => {
  if (!profileId) {
    logger.error("No profile ID provided to getTargetUserId", {
      component: "getTargetUserId"
    });
    return { data: null, error: new Error("No profile ID provided") };
  }

  try {
    logger.info(`Getting user_id for profile: ${profileId}`, {
      component: "getTargetUserId"
    });
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', profileId)
      .single();
    
    if (error) {
      logger.error("Error fetching user_id by profile ID:", {
        error,
        profileId,
        component: "getTargetUserId"
      });
      return { data: null, error };
    }
    
    if (!profile) {
      logger.warn(`No profile found with ID: ${profileId}`, {
        component: "getTargetUserId"
      });
      return { data: null, error: new Error("Profile not found") };
    }
    
    logger.info(`Successfully retrieved user_id for profile: ${profileId}`, {
      userId: profile.user_id,
      component: "getTargetUserId"
    });
    
    return { data: profile.user_id, error: null };
  } catch (error) {
    logger.error("Exception in getTargetUserId:", {
      error,
      profileId,
      component: "getTargetUserId"
    });
    return { data: null, error };
  }
};
