
import { useState, useEffect, useCallback, useRef } from "react";
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
  
  // Use a ref to track if a fetch is already in progress to prevent duplicate requests
  const fetchInProgressRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProfileIdRef = useRef<string | null>(null);
  
  const PAGE_SIZE = 10;

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Memoize the fetchConversations function to prevent recreating it on every render
  const fetchConversations = useCallback(async (forceFresh = false) => {
    // Skip if no profile ID is provided
    if (!currentProfileId) {
      logger.warn("No profile ID provided, cannot fetch conversations", { reason: "missing_profile_id" });
      if (isMountedRef.current) {
        setError("Vous devez être connecté pour voir vos conversations");
        setIsLoading(false);
      }
      return [];
    }
    
    // Prevent concurrent fetches
    if (fetchInProgressRef.current) {
      logger.info("Fetch already in progress, skipping");
      return conversations;
    }
    
    // Check if we already fetched for this profile ID to avoid unnecessary refetches
    if (currentProfileId === lastProfileIdRef.current && !forceFresh && conversations.length > 0) {
      logger.info("Using existing conversations for the same profile", {
        profileId: currentProfileId,
        count: conversations.length
      });
      return conversations;
    }
    
    // Update the last profile ID we fetched for
    lastProfileIdRef.current = currentProfileId;

    // Try to get from cache first if cache is valid and we're not forcing a fresh fetch
    if (!forceFresh && isCacheValid(currentProfileId)) {
      const cachedData = getCachedConversations(currentProfileId);
      if (cachedData && cachedData.length > 0) {
        logger.info("Using cached conversations", { 
          count: cachedData.length,
          profileId: currentProfileId
        });
        if (isMountedRef.current) {
          setConversations(cachedData);
          setError(null);
        }
        return cachedData;
      }
    }

    if (isMountedRef.current) {
      setIsLoading(true);
      setError(null);
    }
    fetchInProgressRef.current = true;

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
      
      // Using the findConversationsByProfileId utility with better error handling
      try {
        const fetchedConversations = await findConversationsByProfileId(currentProfileId);
        
        logger.info("Successfully fetched conversations", { 
          count: fetchedConversations.length,
          profileId: currentProfileId
        });
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          // Cache the conversations
          cacheConversations(currentProfileId, fetchedConversations);
          
          setConversations(fetchedConversations);
          setError(null);
        }
        
        return fetchedConversations;
      } catch (fetchError: any) {
        logger.error("Error fetching conversations from utility", { 
          error: fetchError.message,
          stack: fetchError.stack
        });
        
        if (isMountedRef.current) {
          setError("Erreur lors du chargement des conversations");
        }
        
        throw new Error("Erreur lors du chargement des conversations");
      }
    } catch (error: any) {
      logger.error("Error in fetchConversations", { 
        error: error.message,
        stack: error.stack 
      });
      
      if (isMountedRef.current) {
        setError(error.message || "Erreur lors du chargement des conversations");
      }
      
      return [];
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      fetchInProgressRef.current = false;
    }
  }, [currentProfileId, getCachedConversations, cacheConversations, isCacheValid, logger, conversations.length]);

  // Load more conversations
  const loadMoreConversations = useCallback(async () => {
    if (!currentProfileId || !hasMore || isLoading || fetchInProgressRef.current) return;
    
    setIsLoading(true);
    fetchInProgressRef.current = true;
    
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
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      fetchInProgressRef.current = false;
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
