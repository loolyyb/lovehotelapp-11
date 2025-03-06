
import { useState, useEffect, useCallback } from "react";
import { supabase, safeQueryResult } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { findConversationsByProfileId, getProfileByAuthId } from "@/utils/conversationUtils";

export function useConversationsFetcher(currentProfileId: string | null) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logger = useLogger("useConversationsFetcher");
  
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
      
      // First, check if the profile exists
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
        throw new Error("Profil introuvable. Veuillez vous reconnecter.");
      }

      logger.info("Profile found", { profile: profileCheck });
      
      // Fetch conversations with a more reliable parameterized query
      const fetchedConversations = await findConversationsByProfileId(currentProfileId);
      
      if (fetchedConversations.length === 0) {
        logger.warn("No conversations found for profile", {
          profileId: currentProfileId,
          authUserId: profileCheck.user_id
        });
        
        // Try to fetch auth user information for additional diagnostics
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          logger.info("Auth user found", { 
            authUserId: authData.user.id, 
            email: authData.user.email,
            profileId: currentProfileId
          });
          
          // Double-check profile with auth user ID
          const userProfile = await getProfileByAuthId(authData.user.id);
          if (userProfile && userProfile.id !== currentProfileId) {
            logger.warn("Profile ID mismatch - found another profile for this auth user", {
              currentProfileId,
              foundProfileId: userProfile.id
            });
          }
        }
      } else {
        logger.info("Found conversations", { count: fetchedConversations.length });
      }
      
      // Fetch profiles for conversations we found
      const conversationsWithProfiles = 
        fetchedConversations.length > 0 ? 
        await fetchProfilesForConversations(fetchedConversations, currentProfileId) : 
        [];
      
      setConversations(conversationsWithProfiles);
      setIsLoading(false);
      return conversationsWithProfiles;
      
    } catch (error: any) {
      logger.error("Error in fetchConversations", { error: error.message });
      setError(error.message || "Erreur lors du chargement des conversations");
      setIsLoading(false);
      return [];
    }
  }, [currentProfileId, logger]);
  
  // Helper function to fetch profiles for each conversation
  const fetchProfilesForConversations = async (conversations: any[], currentUser: string) => {
    const result = await Promise.all(
      conversations.map(async (conversation) => {
        // Determine the other user in the conversation
        const otherUserId = 
          conversation.user1_id === currentUser 
            ? conversation.user2_id 
            : conversation.user1_id;
            
        // Fetch the other user's profile
        const { data: otherUser, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', otherUserId)
          .maybeSingle();
          
        if (profileError) {
          logger.error("Error fetching profile for conversation", { error: profileError });
          return {...conversation, otherUser: null};
        }
        
        return {...conversation, otherUser};
      })
    );
    
    return result;
  };

  return {
    conversations,
    setConversations,
    isLoading,
    error,
    fetchConversations
  };
}
