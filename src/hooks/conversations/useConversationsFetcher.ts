
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { findConversationsByProfileId } from "@/utils/conversations";
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
    if (!currentProfileId) {
      logger.warn("No profile ID available, cannot fetch conversations");
      return;
    }
    
    logger.info("Profile ID changed, fetching conversations", { profileId: currentProfileId });
    fetchConversations();
  }, [currentProfileId]); // Only include currentProfileId to prevent infinite loops

  // Memoize the fetchConversations function to prevent recreating it on every render
  const fetchConversations = useCallback(async () => {
    if (!currentProfileId) {
      logger.warn("No profile ID provided, cannot fetch conversations", { reason: "missing_profile_id" });
      setError("Vous devez être connecté pour voir vos conversations");
      return [];
    }

    // Try to get from cache first if cache is valid
    if (isCacheValid(currentProfileId)) {
      const cachedData = getCachedConversations(currentProfileId);
      if (cachedData && cachedData.length > 0) {
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
      
      // Get user's profile to ensure we have the right profile ID
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (profileError) {
        logger.error("Error fetching user profile", { 
          error: profileError,
          userId: user.id
        });
        
        // If profile doesn't exist, create one
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
              username: user.email?.split('@')[0] || `user_${Math.floor(Math.random() * 1000)}`,
              role: 'user'
            }]);
            
          if (insertError) {
            logger.error("Error creating profile", { error: insertError });
            throw new Error("Impossible de créer votre profil utilisateur");
          }
          
          // Use the new profile ID for fetching conversations
          logger.info("Created new profile, using new ID for conversations", { profileId: newProfileId });
          const fetchedConversations = await findConversationsByProfileId(newProfileId);
          setConversations(fetchedConversations);
          cacheConversations(newProfileId, fetchedConversations);
          setIsLoading(false);
          return fetchedConversations;
        } else {
          throw new Error("Erreur lors de la récupération de votre profil");
        }
      }
      
      // Use the verified profile ID to fetch conversations
      const validProfileId = userProfile.id;
      logger.info("Using verified profile ID for conversations", { 
        requestedId: currentProfileId,
        verifiedId: validProfileId
      });
      
      // Using the findConversationsByProfileId utility with better error handling
      try {
        const fetchedConversations = await findConversationsByProfileId(validProfileId);
        
        logger.info("Successfully fetched conversations", { 
          count: fetchedConversations.length,
          profileId: validProfileId
        });
        
        // Cache the conversations
        cacheConversations(validProfileId, fetchedConversations);
        
        setConversations(fetchedConversations);
        setIsLoading(false);
        return fetchedConversations;
      } catch (fetchError: any) {
        logger.error("Error fetching conversations from utility", { 
          error: fetchError.message,
          stack: fetchError.stack
        });
        setIsLoading(false);
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
    }
  }, [currentProfileId, logger, getCachedConversations, cacheConversations, isCacheValid]);

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
    } catch (error: any) {
      logger.error("Error loading more conversations", { error: error.message });
    } finally {
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
