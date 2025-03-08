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
    isCacheValid 
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
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        logger.error("Error getting authenticated user", { error: userError });
        throw new Error("Erreur lors de la récupération de votre profil utilisateur");
      }
      
      if (!user) {
        logger.error("No authenticated user found");
        throw new Error("Vous devez être connecté pour voir vos conversations");
      }
      
      logger.info("Performing direct query to verify RLS permissions", {
        profileId: currentProfileId 
      });
      
      const { data: directQueryData, error: directQueryError } = await supabase
        .from('conversations')
        .select('id')
        .filter('user1_id', 'eq', currentProfileId)
        .filter('status', 'eq', 'active');
      
      if (directQueryError) {
        logger.error("Direct query error (user1) - possible RLS configuration issue", {
          error: directQueryError,
          profileId: currentProfileId
        });
      } else {
        logger.info("Direct query (user1) successful", {
          count: directQueryData?.length || 0,
          profileId: currentProfileId
        });
      }
      
      const { data: directQueryData2, error: directQueryError2 } = await supabase
        .from('conversations')
        .select('id')
        .filter('user2_id', 'eq', currentProfileId)
        .filter('status', 'eq', 'active');
      
      if (directQueryError2) {
        logger.error("Direct query error (user2) - possible RLS configuration issue", {
          error: directQueryError2,
          profileId: currentProfileId
        });
      } else {
        logger.info("Direct query (user2) successful", {
          count: directQueryData2?.length || 0,
          profileId: currentProfileId
        });
      }
      
      const totalDirectQueryCount = (directQueryData?.length || 0) + (directQueryData2?.length || 0);
      logger.info("Total conversations from direct queries", {
        count: totalDirectQueryCount,
        profileId: currentProfileId
      });
      
      try {
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
        
        if (totalDirectQueryCount > 0 && (directQueryData || directQueryData2)) {
          logger.info("Trying to construct conversations from direct queries", {
            profileId: currentProfileId
          });
          
          try {
            const manualConversations = [];
            
            if (directQueryData && directQueryData.length > 0) {
              for (const conv of directQueryData) {
                const { data: fullConv } = await supabase
                  .from('conversations')
                  .select('*')
                  .eq('id', conv.id)
                  .single();
                  
                if (fullConv) {
                  manualConversations.push(fullConv);
                }
              }
            }
            
            if (directQueryData2 && directQueryData2.length > 0) {
              for (const conv of directQueryData2) {
                if (manualConversations.some(c => c.id === conv.id)) continue;
                
                const { data: fullConv } = await supabase
                  .from('conversations')
                  .select('*')
                  .eq('id', conv.id)
                  .single();
                  
                if (fullConv) {
                  manualConversations.push(fullConv);
                }
              }
            }
            
            if (manualConversations.length > 0) {
              logger.info("Successfully constructed conversations manually", {
                count: manualConversations.length,
                profileId: currentProfileId
              });
              
              const processedConversations = await Promise.all(manualConversations.map(async (conversation) => {
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
              
              if (isMountedRef.current) {
                cacheConversations(currentProfileId, processedConversations);
                setConversations(processedConversations);
                setError(null);
                setIsLoading(false);
                retryCountRef.current = 0;
              }
              
              fetchInProgressRef.current = false;
              return processedConversations;
            }
          } catch (manualError) {
            logger.error("Error constructing conversations manually", {
              error: manualError,
              profileId: currentProfileId
            });
          }
        }
        
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
  }, [currentProfileId, getCachedConversations, cacheConversations, isCacheValid, logger, toast, conversations.length]);

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
      fetchConversations(true);
    }
  }, [currentProfileId, fetchConversations, logger]);

  useEffect(() => {
    if (error && currentProfileId && retryCountRef.current < maxRetries) {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      const delay = Math.min(3000 * (2 ** retryCountRef.current), 30000);
      
      fetchTimeoutRef.current = setTimeout(() => {
        logger.info("Automatically retrying conversation fetch after error", {
          profileId: currentProfileId,
          retryCount: retryCountRef.current,
          delay
        });
        fetchConversations(true);
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
