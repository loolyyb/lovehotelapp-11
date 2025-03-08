
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { findConversationsByProfileId, getProfileByAuthId } from "@/utils/conversationUtils";
import { useToast } from "@/hooks/use-toast";
import { useConversationCache } from "./useConversationCache";

export function useConversationsFetcher(currentProfileId: string | null) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const logger = useLogger("useConversationsFetcher");
  const { toast } = useToast();
  const { 
    getCachedConversations, 
    cacheConversations, 
    isCacheValid 
  } = useConversationCache();
  
  const PAGE_SIZE = 10;
  
  // Auto-fetch when profile ID changes
  useEffect(() => {
    if (currentProfileId) {
      logger.info("Profile ID changed, fetching conversations", { profileId: currentProfileId });
      fetchConversations();
    } else {
      logger.warn("No profile ID available, cannot fetch conversations");
    }
  }, [currentProfileId]);

  // Memoize the fetchConversations function to prevent recreating it on every render
  const fetchConversations = useCallback(async (useCache = true) => {
    if (!currentProfileId) {
      logger.warn("No profile ID provided, cannot fetch conversations", { reason: "missing_profile_id" });
      setError("Vous devez être connecté pour voir vos conversations");
      return [];
    }

    // Try to get from cache first if cache is requested
    if (useCache && isCacheValid(currentProfileId)) {
      const cachedData = getCachedConversations(currentProfileId);
      if (cachedData) {
        logger.info("Using cached conversations", { 
          count: cachedData.length,
          profileId: currentProfileId
        });
        setConversations(cachedData);
        return cachedData;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.info("Fetching conversations for profile ID", { profileId: currentProfileId });
      
      // Get the current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        logger.error("Error getting authenticated user", { error: userError });
        throw new Error("Erreur lors de la récupération de votre profil utilisateur");
      }
      
      if (!user) {
        logger.error("No authenticated user found");
        throw new Error("Vous devez être connecté pour voir vos conversations");
      }
      
      // Get user's profile to check role and confirm access permissions
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .single();
        
      if (profileError) {
        logger.error("Error fetching user profile", { 
          error: profileError,
          userId: user.id
        });
        
        // Check if error is because profile doesn't exist
        if (profileError.code === 'PGRST116') {
          logger.warn("Profile not found, attempting to create one");
          
          // Create a profile for the user
          const newProfileId = crypto.randomUUID();
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: newProfileId,
              user_id: user.id,
              full_name: user.email?.split('@')[0] || 'Utilisateur',
              username: user.email?.split('@')[0] || 'user_' + Math.floor(Math.random() * 1000),
              role: 'user'
            }]);
            
          if (insertError) {
            logger.error("Error creating profile", { error: insertError });
            throw new Error("Impossible de créer votre profil utilisateur");
          }
          
          // Use the new profile ID
          logger.info("Created new profile", { profileId: newProfileId });
        } else {
          throw new Error("Erreur lors de la récupération de votre profil");
        }
      }
      
      if (!userProfile && !profileError) {
        logger.error("No profile found for authenticated user", { userId: user.id });
        throw new Error("Profil introuvable. Veuillez vous reconnecter.");
      }
      
      // Using the findConversationsByProfileId utility with better error handling
      try {
        const fetchedConversations = await findConversationsByProfileId(currentProfileId);
        
        logger.info("Setting conversations", { 
          count: fetchedConversations.length,
          profileId: currentProfileId
        });
        
        // Cache the conversations
        cacheConversations(currentProfileId, fetchedConversations);
        
        setConversations(fetchedConversations);
        setIsLoading(false);
        return fetchedConversations;
      } catch (fetchError: any) {
        logger.error("Error fetching conversations from utility", { 
          error: fetchError.message,
          stack: fetchError.stack
        });
        throw new Error("Erreur lors du chargement des conversations");
      }
    } catch (error: any) {
      logger.error("Error in fetchConversations", { 
        error: error.message,
        stack: error.stack 
      });
      setError(error.message || "Erreur lors du chargement des conversations");
      setIsLoading(false);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [currentProfileId, logger, toast, getCachedConversations, cacheConversations, isCacheValid]);

  // Load more conversations
  const loadMoreConversations = useCallback(async () => {
    if (!currentProfileId || !hasMore || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const nextPage = page + 1;
      logger.info("Loading more conversations", { page: nextPage, profileId: currentProfileId });
      
      // Implement pagination logic here
      // This is just a placeholder - in a real implementation,
      // you'd need to modify the findConversationsByProfileId function
      // to support pagination
      
      setPage(nextPage);
      setIsLoading(false);
    } catch (error: any) {
      logger.error("Error loading more conversations", { error: error.message });
      setIsLoading(false);
    }
  }, [currentProfileId, page, hasMore, isLoading, logger]);

  return {
    conversations,
    setConversations,
    isLoading,
    error,
    fetchConversations,
    loadMoreConversations,
    hasMore
  };
}
