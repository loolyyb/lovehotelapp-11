
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { findConversationsByProfileId } from "@/utils/conversations";
import { useToast } from "@/hooks/use-toast";
import { useConversationCache } from "./useConversationCache";
import { AlertService } from "@/services/AlertService";

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
    isCacheValid,
    clearCache
  } = useConversationCache();
  
  const fetchInProgressRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProfileIdRef = useRef<string | null>(null);
  const fetchAttemptedRef = useRef(false);
  const retryCountRef = useRef(0);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 5;
  
  const PAGE_SIZE = 10;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);
  
  const fetchConversations = useCallback(async (forceFresh = false) => {
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

    fetchAttemptedRef.current = true;
    
    if (fetchInProgressRef.current) {
      logger.info("Fetch already in progress, skipping");
      return conversations;
    }
    
    if (currentProfileId === lastProfileIdRef.current && !forceFresh && conversations.length > 0) {
      logger.info("Using existing conversations for the same profile", {
        profileId: currentProfileId,
        count: conversations.length
      });
      return conversations;
    }
    
    lastProfileIdRef.current = currentProfileId;

    // Important: Try using cache first but clear it if we're forcing fresh
    if (forceFresh) {
      clearCache();
      logger.info("Forced fresh fetch requested, cache cleared", { profileId: currentProfileId });
    } else if (isCacheValid(currentProfileId)) {
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
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        logger.error("Error getting authenticated user", { error: userError });
        throw new Error("Erreur lors de la récupération de votre profil utilisateur");
      }
      
      if (!user) {
        logger.error("No authenticated user found");
        throw new Error("Vous devez être connecté pour voir vos conversations");
      }
      
      try {
        // First attempt: Use the optimized findConversationsByProfileId
        const fetchedConversations = await findConversationsByProfileId(currentProfileId);
        
        logger.info("Successfully fetched conversations", { 
          count: fetchedConversations.length,
          profileId: currentProfileId,
          conversationIds: fetchedConversations.map(c => c.id)
        });
        
        if (isMountedRef.current) {
          cacheConversations(currentProfileId, fetchedConversations);
          setConversations(fetchedConversations);
          setError(null);
          setIsLoading(false);
          retryCountRef.current = 0;
        }
        
        fetchInProgressRef.current = false;
        return fetchedConversations;
        
      } catch (fetchError: any) {
        logger.error("Error fetching conversations from utility", { 
          error: fetchError.message,
          stack: fetchError.stack
        });
        
        AlertService.captureException(fetchError, {
          context: "fetchConversations",
          profileId: currentProfileId
        });
        
        // DIRECT FALLBACK APPROACH:
        // If the optimized utility fails, try direct raw queries
        
        logger.info("Attempting direct fallback queries for user ID:", { 
          profileId: currentProfileId 
        });
        
        // PART 1: Get conversations directly - try user1_id first
        const { data: directUser1Data, error: directUser1Error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user1_id', currentProfileId)
          .eq('status', 'active');
        
        if (directUser1Error) {
          logger.error("Direct user1 query error", { error: directUser1Error });
        } else {
          logger.info("Direct user1 query successful", { count: directUser1Data?.length || 0 });
        }
        
        // PART 2: Get conversations directly - try user2_id
        const { data: directUser2Data, error: directUser2Error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user2_id', currentProfileId)
          .eq('status', 'active');
          
        if (directUser2Error) {
          logger.error("Direct user2 query error", { error: directUser2Error });
        } else {
          logger.info("Direct user2 query successful", { count: directUser2Data?.length || 0 });
        }
        
        // Combine results and remove duplicates
        const allConversations = [];
        if (directUser1Data && directUser1Data.length > 0) {
          allConversations.push(...directUser1Data);
        }
        
        if (directUser2Data && directUser2Data.length > 0) {
          const existingIds = new Set(allConversations.map(c => c.id));
          const uniqueUser2Convs = directUser2Data.filter(c => !existingIds.has(c.id));
          allConversations.push(...uniqueUser2Convs);
        }
        
        if (allConversations.length > 0) {
          logger.info("Successfully retrieved conversations through fallback", {
            count: allConversations.length,
            ids: allConversations.map(c => c.id)
          });
          
          // Now enrich these conversations with user details
          const processedConversations = await Promise.all(allConversations.map(async (conversation) => {
            try {
              const otherUserId = conversation.user1_id === currentProfileId 
                ? conversation.user2_id 
                : conversation.user1_id;
              
              const { data: otherUserProfile } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .eq('id', otherUserId)
                .maybeSingle();
                
              const { data: messages } = await supabase
                .from('messages')
                .select('id, content, created_at, sender_id, read_at')
                .eq('conversation_id', conversation.id)
                .order('created_at', { ascending: false })
                .limit(10);
                
              return {
                ...conversation,
                otherUser: otherUserProfile || { id: otherUserId, username: 'Utilisateur inconnu' },
                messages: messages || []
              };
            } catch (error) {
              return {
                ...conversation,
                otherUser: { id: conversation.user1_id === currentProfileId ? conversation.user2_id : conversation.user1_id, username: 'Utilisateur inconnu' },
                messages: []
              };
            }
          }));
          
          // Sort conversations by most recent message
          const sortedConversations = processedConversations.sort((a, b) => {
            const latestMessageA = a.messages?.[0]?.created_at || a.updated_at;
            const latestMessageB = b.messages?.[0]?.created_at || b.updated_at;
            return new Date(latestMessageB).getTime() - new Date(latestMessageA).getTime();
          });
          
          if (isMountedRef.current) {
            cacheConversations(currentProfileId, sortedConversations);
            setConversations(sortedConversations);
            setError(null);
            setIsLoading(false);
            retryCountRef.current = 0;
          }
          
          fetchInProgressRef.current = false;
          return sortedConversations;
        }
        
        // If all attempts failed
        throw new Error("Impossible de récupérer vos conversations");
      }
    } catch (error: any) {
      logger.error("Error in fetchConversations", { 
        error: error.message,
        stack: error.stack 
      });
      
      // Implement exponential backoff for retries
      retryCountRef.current += 1;
      
      if (isMountedRef.current) {
        setError(error.message || "Erreur lors du chargement des conversations");
        setIsLoading(false);
      }
      
      fetchInProgressRef.current = false;
      
      if (retryCountRef.current <= maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
        logger.info(`Scheduling retry ${retryCountRef.current}/${maxRetries} in ${delayMs}ms`);
        
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        
        fetchTimeoutRef.current = setTimeout(() => {
          logger.info(`Executing retry ${retryCountRef.current}/${maxRetries}`);
          fetchConversations(true);
        }, delayMs);
      }
      
      return [];
    }
  }, [currentProfileId, getCachedConversations, cacheConversations, isCacheValid, clearCache, logger, toast, conversations.length]);

  const loadMoreConversations = useCallback(async () => {
    if (!currentProfileId || !hasMore || isLoading || fetchInProgressRef.current) return;
    
    setIsLoading(true);
    fetchInProgressRef.current = true;
    
    try {
      const nextPage = page + 1;
      logger.info("Loading more conversations", { page: nextPage, profileId: currentProfileId });
      
      setPage(nextPage);
      setIsLoading(false);
    } catch (error: any) {
      logger.error("Error loading more conversations", { error: error.message });
      setIsLoading(false);
    } finally {
      fetchInProgressRef.current = false;
    }
  }, [currentProfileId, page, hasMore, isLoading, logger]);

  useEffect(() => {
    if (currentProfileId && !fetchAttemptedRef.current) {
      logger.info("Initial fetch triggered by profile ID change or mount", { profileId: currentProfileId });
      fetchConversations(false); // Use cache for initial load for better performance
    }
  }, [currentProfileId, fetchConversations, logger]);

  // Automatic retry for errors with exponential backoff
  useEffect(() => {
    if (error && currentProfileId && retryCountRef.current < maxRetries) {
      const delay = Math.min(3000 * Math.pow(2, retryCountRef.current), 30000);
      logger.info(`Automatic retry scheduled in ${delay}ms`, {
        retry: retryCountRef.current + 1,
        maxRetries
      });
      
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      fetchTimeoutRef.current = setTimeout(() => {
        logger.info("Executing automatic retry after error", {
          profileId: currentProfileId,
          retryCount: retryCountRef.current + 1
        });
        fetchConversations(true); // Force fresh fetch on retry
      }, delay);
      
      return () => {
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
      };
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
