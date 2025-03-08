
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";

/**
 * Get a user's profile by their auth ID
 * @param authId The user's auth ID
 * @returns The user's profile or null if not found
 */
export const getProfileByAuthId = async (authId: string) => {
  if (!authId) {
    logger.error("No auth ID provided to getProfileByAuthId", { component: "getProfileByAuthId" });
    return null;
  }
  
  try {
    logger.info(`Getting profile for auth ID: ${authId}`, { component: "getProfileByAuthId" });
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        logger.warn(`No profile found for auth ID: ${authId}`, { component: "getProfileByAuthId" });
        return null;
      }
      
      logger.error("Error fetching profile by auth ID:", {
        error,
        authId,
        component: "getProfileByAuthId"
      });
      throw error;
    }
    
    logger.info(`Successfully retrieved profile for auth ID: ${authId}`, {
      profileId: profile?.id,
      component: "getProfileByAuthId"
    });
    
    return profile;
  } catch (error) {
    logger.error("Exception in getProfileByAuthId:", {
      error,
      authId,
      component: "getProfileByAuthId"
    });
    throw error;
  }
};

/**
 * Get the current user's profile
 * @returns The current user's profile or null if not authenticated
 */
export const getCurrentUserProfile = async () => {
  try {
    // Get the current user's auth ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      logger.error("Auth error in getCurrentUserProfile", {
        error: authError,
        component: "getCurrentUserProfile"
      });
      throw authError;
    }
    
    if (!user) {
      logger.warn("No authenticated user in getCurrentUserProfile", {
        component: "getCurrentUserProfile"
      });
      return null;
    }
    
    // Get the user's profile
    return await getProfileByAuthId(user.id);
  } catch (error) {
    logger.error("Exception in getCurrentUserProfile:", {
      error,
      component: "getCurrentUserProfile"
    });
    throw error;
  }
};
