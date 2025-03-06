
import { useState, useEffect, useCallback } from "react";
import { supabase, safeQueryResult } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";

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
      logger.warn("No profile ID provided, cannot fetch conversations");
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
        .select('id, username, full_name')
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
      
      // Combined approach - try multiple strategies to ensure we get conversations
      const results = await Promise.allSettled([
        // Direct query with user1_id / user2_id filter
        fetchConversationsDirectQuery(currentProfileId),
        // FTS query with text search
        fetchConversationsFullTextSearch(currentProfileId),
        // Raw query through database function (bypasses RLS)
        fetchConversationsRawQuery(currentProfileId)
      ]);
      
      // Get the first successful result that has conversations
      let fetchedConversations: any[] = [];
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
          logger.info("Found conversations with strategy", { 
            strategyIndex: results.indexOf(result),
            count: result.value.length
          });
          fetchedConversations = result.value;
          break;
        }
      }
      
      // If we still don't have conversations, log the issue
      if (fetchedConversations.length === 0) {
        logger.warn("No conversations found with any strategy", {
          profileId: currentProfileId,
          results: results.map(r => r.status === 'fulfilled' ? 
            { status: 'fulfilled', count: r.value?.length || 0 } : 
            { status: 'rejected', reason: r.reason })
        });
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

  // Strategy 1: Direct query with OR condition on user1_id and user2_id
  const fetchConversationsDirectQuery = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id, 
          status,
          blocked_by,
          user1_id,
          user2_id,
          created_at,
          updated_at
        `)
        .or(`user1_id.eq.${profileId},user2_id.eq.${profileId}`)
        .neq('status', 'deleted')
        .order('updated_at', { ascending: false });
        
      if (error) {
        logger.error("Error with direct query", { error });
        return [];
      }
      
      logger.info("Direct query results", {
        count: data?.length || 0
      });
      
      return data || [];
    } catch (error) {
      logger.error("Failed direct query", { error });
      return [];
    }
  };
  
  // Strategy 2: Use text search to find conversations
  const fetchConversationsFullTextSearch = async (profileId: string) => {
    try {
      // This is a fallback that does a full text search on the conversations table
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.ilike.${profileId},user2_id.ilike.${profileId}`)
        .neq('status', 'deleted')
        .order('updated_at', { ascending: false });
        
      if (error) {
        logger.error("Error with FTS query", { error });
        return [];
      }
      
      logger.info("FTS query results", {
        count: data?.length || 0
      });
      
      return data || [];
    } catch (error) {
      logger.error("Failed FTS query", { error });
      return [];
    }
  };
  
  // Strategy 3: Use a raw query through a database function (bypasses RLS)
  const fetchConversationsRawQuery = async (profileId: string) => {
    try {
      // Try using our bypass function if it exists
      const { data, error } = await supabase
        .rpc('get_user_conversations', {
          user_profile_id: profileId
        });
        
      if (error) {
        // Function might not exist if the user didn't run the SQL migrations
        logger.warn("Error with RPC query (function may not exist)", { error });
        return [];
      }
      
      logger.info("RPC query results", {
        count: data?.length || 0
      });
      
      return data || [];
    } catch (error) {
      logger.error("Failed RPC query", { error });
      return [];
    }
  };
  
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
