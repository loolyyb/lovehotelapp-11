
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
      
      // Use the improved findConversationsByProfileId function
      const fetchedConversations = await findConversationsByProfileId(currentProfileId);
      
      if (fetchedConversations.length === 0) {
        logger.warn("No conversations found for profile", {
          profileId: currentProfileId,
          authUserId: profileCheck.user_id
        });
        
        // Check if there are any conversations in the database at all
        const { data: allConversations, error: allConvError } = await supabase
          .from('conversations')
          .select('id, user1_id, user2_id, status')
          .limit(5);
          
        if (allConvError) {
          logger.error("Error checking conversations table", { error: allConvError });
        } else {
          logger.info("Database check - found conversations", { 
            count: allConversations?.length || 0,
            samples: allConversations?.map(c => ({ id: c.id, user1: c.user1_id, user2: c.user2_id }))
          });
        }
      } else {
        logger.info("Found conversations", { count: fetchedConversations.length });
      }
      
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
  }, [currentProfileId, logger, toast]);
  
  // Helper function to fetch profiles for each conversation
  const fetchProfilesForConversations = async (conversations: any[], currentUser: string) => {
    const result = await Promise.all(
      conversations.map(async (conversation) => {
        // Determine the other user in the conversation - use the existing user1 and user2 objects
        const otherUser = 
          conversation.user1?.id === currentUser 
            ? conversation.user2 
            : conversation.user1;
            
        if (!otherUser) {
          // If for some reason we don't have the other user info, try to fetch it
          const otherUserId = 
            conversation.user1_id === currentUser 
              ? conversation.user2_id 
              : conversation.user1_id;
              
          const { data: fetchedUser, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', otherUserId)
            .maybeSingle();
            
          if (profileError) {
            logger.error("Error fetching profile for conversation", { error: profileError });
            return {...conversation, otherUser: null};
          }
          
          return {...conversation, otherUser: fetchedUser};
        }
        
        // If we already have the other user's info from the original query
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
