
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";

/**
 * Retrieves a profile by its associated auth user ID
 * @param authUserId The auth user ID to look up
 * @returns The profile object or null if not found
 */
export const getProfileByAuthId = async (authUserId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, username, avatar_url, role')
      .eq('user_id', authUserId)
      .single();
    
    if (error) {
      logger.error('Error fetching profile by auth ID:', {
        error,
        authUserId,
        component: "getProfileByAuthId"
      });
      return null;
    }

    return profile;
  } catch (error) {
    logger.error('Exception in getProfileByAuthId:', {
      error,
      authUserId,
      component: "getProfileByAuthId"
    });
    return null;
  }
};

/**
 * Retrieves a profile by its ID
 * @param profileId The profile ID to look up
 * @returns Object with either error or data property
 */
export const getTargetUserId = async (profileId: string) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profileId)
      .single();
    
    if (profileError) {
      logger.error('Error fetching profile:', {
        error: profileError,
        profileId,
        component: "getTargetUserId"
      });
      return { error: "Profile not found" };
    }

    if (!profile) {
      logger.error('No profile found with ID:', {
        profileId,
        component: "getTargetUserId"
      });
      return { error: "Profile not found" };
    }

    return { data: profile.id };
  } catch (error) {
    logger.error('Error in getTargetUserId:', {
      error,
      profileId,
      component: "getTargetUserId"
    });
    return { error: "Unable to retrieve user information" };
  }
};
