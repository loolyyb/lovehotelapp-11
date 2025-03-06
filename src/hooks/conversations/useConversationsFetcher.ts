
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { findConversationsByProfileId, getProfileByAuthId } from "@/utils/conversationUtils";
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
      
      // Verify profile exists
      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, user_id')
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
          
          if (profile && profile.id !== currentProfileId) {
            logger.warn("Found a different profile for this auth user - using that instead", {
              requestedProfileId: currentProfileId,
              foundProfileId: profile.id
            });
            
            // Important: We'll use the correct profile ID we found
            const fetchedConversations = await findConversationsByProfileId(profile.id);
            setConversations(fetchedConversations);
            setIsLoading(false);
            return fetchedConversations;
          }
        }
        
        // If we still don't have a valid profile
        throw new Error("Profil introuvable. Veuillez vous reconnecter.");
      }

      logger.info("Profile found, proceeding to fetch conversations", { profile: profileCheck });
      
      // Use the simplified findConversationsByProfileId function which should avoid the relationship issues
      const fetchedConversations = await findConversationsByProfileId(currentProfileId);
      
      if (fetchedConversations.length === 0) {
        logger.warn("No conversations found for profile", {
          profileId: currentProfileId,
          authUserId: profileCheck.user_id
        });
        
        // For diagnostic purposes, try to create a conversation
        logger.info("Attempting to create a test conversation for diagnostic purposes");
        
        try {
          // Check if there are any other profiles in the system
          const { data: otherProfiles, error: otherProfilesError } = await supabase
            .from('profiles')
            .select('id')
            .neq('id', currentProfileId)
            .limit(1);
            
          if (otherProfilesError) {
            logger.error("Error finding other profiles:", otherProfilesError);
          } else if (otherProfiles && otherProfiles.length > 0) {
            logger.info("Found another profile to create test conversation with", {
              otherProfileId: otherProfiles[0].id
            });
            
            // Create a test conversation
            const { data: newConv, error: convError } = await supabase
              .from('conversations')
              .insert({
                user1_id: currentProfileId,
                user2_id: otherProfiles[0].id,
                status: 'active'
              })
              .select()
              .single();
              
            if (convError) {
              logger.error("Error creating test conversation:", convError);
            } else if (newConv) {
              logger.info("Successfully created test conversation:", newConv);
              
              // Try fetching conversations again after creating test conversation
              const updatedConversations = await findConversationsByProfileId(currentProfileId);
              if (updatedConversations.length > 0) {
                logger.info("Successfully retrieved conversations after creating test conversation", {
                  count: updatedConversations.length
                });
                setConversations(updatedConversations);
                setIsLoading(false);
                return updatedConversations;
              }
            }
          } else {
            logger.info("No other profiles found to create test conversation");
          }
        } catch (testError) {
          logger.error("Error during test conversation creation:", testError);
        }
      }
      
      logger.info("Setting conversations", { count: fetchedConversations.length });
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
