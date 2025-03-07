
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { findConversationsByProfileId, getProfileByAuthId, createTestConversation } from "@/utils/conversationUtils";
import { useToast } from "@/hooks/use-toast";

export function useConversationsFetcher(currentProfileId: string | null) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logger = useLogger("useConversationsFetcher");
  const { toast } = useToast();
  
  // Auto-fetch when profile ID changes
  useEffect(() => {
    if (currentProfileId) {
      logger.info("Profile ID changed, fetching conversations", { profileId: currentProfileId });
      fetchConversations();
    }
  }, [currentProfileId]);

  const fetchConversations = useCallback(async () => {
    if (!currentProfileId) {
      logger.warn("No profile ID provided, cannot fetch conversations", { reason: "missing_profile_id" });
      setError("Vous devez être connecté pour voir vos conversations");
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.info("Fetching conversations for profile ID", { profileId: currentProfileId });
      
      // Verify profile exists and get user role
      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, user_id, role')
        .eq('id', currentProfileId)
        .maybeSingle();
        
      if (profileError) {
        logger.error("Error checking profile", { error: profileError });
        throw new Error("Erreur lors de la vérification du profil");
      }
      
      if (!profileCheck) {
        logger.warn("Profile not found in database", { profileId: currentProfileId });
        
        // Try to get profile from auth user as fallback
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          logger.info("Attempting to use auth user to find profile", { authId: data.user.id });
          const profile = await getProfileByAuthId(data.user.id);
          
          if (profile) {
            logger.warn("Found a profile for this auth user", {
              requestedProfileId: currentProfileId,
              foundProfileId: profile.id
            });
            
            // Use the found profile ID but don't override the requested one
            if (profile.id !== currentProfileId) {
              logger.info("Using the requested profile ID, may require admin permissions", {
                requestedProfileId: currentProfileId,
                userProfileId: profile.id,
                userRole: profile.role
              });
            }
          }
        }
        
        if (!profileCheck) {
          throw new Error("Profil introuvable. Veuillez vous reconnecter.");
        }
      }

      const userRole = profileCheck?.role || 'user';
      logger.info("Profile found, proceeding to fetch conversations", { 
        profile: profileCheck,
        role: userRole
      });
      
      // Use findConversationsByProfileId which now properly respects the requested profile ID
      // Row Level Security will handle access control
      const fetchedConversations = await findConversationsByProfileId(currentProfileId);
      
      // If no conversations found and user is not admin, we might want to create a test conversation
      if (fetchedConversations.length === 0 && userRole !== 'admin') {
        logger.warn("No conversations found for profile", {
          profileId: currentProfileId,
          authUserId: profileCheck?.user_id,
          role: userRole
        });
      }
      
      logger.info("Setting conversations", { 
        count: fetchedConversations.length,
        profileId: currentProfileId,
        role: userRole
      });
      
      setConversations(fetchedConversations);
      setIsLoading(false);
      return fetchedConversations;
    } catch (error: any) {
      logger.error("Error in fetchConversations", { error: error.message });
      setError(error.message || "Erreur lors du chargement des conversations");
      setIsLoading(false);
      return [];
    }
  }, [currentProfileId, logger, toast]);

  return {
    conversations,
    setConversations,
    isLoading,
    error,
    fetchConversations
  };
}
