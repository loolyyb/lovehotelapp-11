
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { findConversationsByProfileId } from "@/utils/conversations";
import { useToast } from "@/hooks/use-toast";
import { useConversationCache } from "./useConversationCache";

export function useConversationsFetcher(currentProfileId: string | null) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const fetchAttemptedRef = useRef(false);
  const retryCountRef = useRef(0);
  
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
      if (!fetchAttemptedRef.current) {
        fetchAttemptedRef.current = true;
        logger.warn("No profile ID provided, cannot fetch conversations", { reason: "missing_profile_id" });
        
        if (isMountedRef.current) {
          setError("Vous devez être connecté pour voir vos conversations");
          setIsLoading(false);
        }
      }
      return [];
    }

    // Reset fetch attempted flag when we have a profile ID
    fetchAttemptedRef.current = true;
    
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
          setIsLoading(false);
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
      logger.info("Fetching conversations for profile ID", { 
        profileId: currentProfileId,
        retryCount: retryCountRef.current
      });
      
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
          profileId: currentProfileId,
          conversationIds: fetchedConversations.map(c => c.id)
        });
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          // Cache the conversations
          cacheConversations(currentProfileId, fetchedConversations);
          
          setConversations(fetchedConversations);
          setError(null);
          setIsLoading(false);
          // Reset retry counter on success
          retryCountRef.current = 0;
        }
        
        fetchInProgressRef.current = false;
        return fetchedConversations;
      } catch (fetchError: any) {
        logger.error("Error fetching conversations from utility", { 
          error: fetchError.message,
          stack: fetchError.stack
        });
        
        // Increment retry counter
        retryCountRef.current += 1;
        
        if (isMountedRef.current) {
          setError("Erreur lors du chargement des conversations");
          setIsLoading(false);
        }
        
        fetchInProgressRef.current = false;
        throw new Error("Erreur lors du chargement des conversations");
      }
    } catch (error: any) {
      logger.error("Error in fetchConversations", { 
        error: error.message,
        stack: error.stack 
      });
      
      if (isMountedRef.current) {
        setError(error.message || "Erreur lors du chargement des conversations");
        setIsLoading(false);
      }
      
      fetchInProgressRef.current = false;
      return [];
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
      setIsLoading(false);
    } catch (error: any) {
      logger.error("Error loading more conversations", { error: error.message });
      setIsLoading(false);
    } finally {
      fetchInProgressRef.current = false;
    }
  }, [currentProfileId, page, hasMore, isLoading, logger]);

  // Initial fetch when component mounts or profile ID changes
  useEffect(() => {
    if (currentProfileId && !fetchAttemptedRef.current) {
      logger.info("Initial fetch triggered by profile ID change or mount", { profileId: currentProfileId });
      fetchConversations();
    }
  }, [currentProfileId, fetchConversations, logger]);

  // Add an automatic retry mechanism for initial load failures
  useEffect(() => {
    if (error && currentProfileId && retryCountRef.current < 3) {
      const retryTimer = setTimeout(() => {
        logger.info("Automatically retrying conversation fetch after error", {
          profileId: currentProfileId,
          retryCount: retryCountRef.current
        });
        fetchConversations(true);
      }, 3000 * (retryCountRef.current + 1)); // Exponential backoff
      
      return () => clearTimeout(retryTimer);
    }
  }, [error, currentProfileId, fetchConversations, logger]);

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
