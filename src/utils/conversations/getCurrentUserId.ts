
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";

/**
 * Retrieves the current authenticated user ID
 * @returns The user ID if authenticated, null otherwise
 */
export const getCurrentUserId = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return user.id;
  } catch (error) {
    logger.error('Error getting current user ID:', {
      error,
      component: "getCurrentUserId"
    });
    return null;
  }
};
