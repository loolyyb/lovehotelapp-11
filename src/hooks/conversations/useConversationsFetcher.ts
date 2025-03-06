
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
      
      // Try multiple strategies to get conversations, starting with the most reliable
      // We'll try each strategy in order and use the first one that returns results
      
      // Strategy 1: Direct query with explicit user1_id/user2_id conditions
      logger.info("Trying direct query strategy", { profileId: currentProfileId });
      let fetchedConversations = await fetchConversationsDirectQuery(currentProfileId);
      
      // Strategy 2: Try a text match approach if direct query failed
      if (fetchedConversations.length === 0) {
        logger.info("Direct query returned no results, trying text search", { profileId: currentProfileId });
        fetchedConversations = await fetchConversationsTextSearch(currentProfileId);
      }
      
      // Strategy 3: Try a fallback query with cast if all else fails
      if (fetchedConversations.length === 0) {
        logger.info("Text search returned no results, trying fallback query", { profileId: currentProfileId });
        fetchedConversations = await fetchConversationsFallback(currentProfileId);
      }
      
      // If we still don't have conversations, log the issue
      if (fetchedConversations.length === 0) {
        logger.warn("No conversations found with any strategy", {
          profileId: currentProfileId
        });
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
  
  // Strategy 2: Use simple text search to find conversations
  const fetchConversationsTextSearch = async (profileId: string) => {
    try {
      // Using .eq() instead of .ilike() to avoid the type issue
      const { data: user1Conversations, error: error1 } = await supabase
        .from('conversations')
        .select('*')
        .eq('user1_id', profileId)
        .neq('status', 'deleted')
        .order('updated_at', { ascending: false });
        
      const { data: user2Conversations, error: error2 } = await supabase
        .from('conversations')
        .select('*')
        .eq('user2_id', profileId)
        .neq('status', 'deleted')
        .order('updated_at', { ascending: false });
        
      if (error1) {
        logger.error("Error fetching user1 conversations", { error: error1 });
      }
      
      if (error2) {
        logger.error("Error fetching user2 conversations", { error: error2 });
      }
      
      // Combine both result sets
      const combinedResults = [
        ...(user1Conversations || []),
        ...(user2Conversations || [])
      ];
      
      // Remove any duplicates by ID
      const uniqueConversations = combinedResults.filter(
        (conversation, index, self) => 
          index === self.findIndex(c => c.id === conversation.id)
      );
      
      logger.info("Text search query results", {
        user1Count: user1Conversations?.length || 0,
        user2Count: user2Conversations?.length || 0,
        combinedCount: uniqueConversations.length
      });
      
      return uniqueConversations;
    } catch (error) {
      logger.error("Failed text search query", { error });
      return [];
    }
  };
  
  // Strategy 3: Fallback with explicit SQL parameters to handle type issues
  const fetchConversationsFallback = async (profileId: string) => {
    try {
      // Using explicit parameters and the .match() approach
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .filter('user1_id', 'eq', profileId)
        .neq('status', 'deleted')
        .order('updated_at', { ascending: false });
        
      if (error) {
        logger.error("Error with fallback query for user1", { error });
        return [];
      }
      
      // Try the second query if the first returned no results
      if (!data || data.length === 0) {
        const { data: data2, error: error2 } = await supabase
          .from('conversations')
          .select('*')
          .filter('user2_id', 'eq', profileId)
          .neq('status', 'deleted')
          .order('updated_at', { ascending: false });
          
        if (error2) {
          logger.error("Error with fallback query for user2", { error: error2 });
          return [];
        }
        
        logger.info("Fallback query results for user2", {
          count: data2?.length || 0
        });
        
        return data2 || [];
      }
      
      logger.info("Fallback query results for user1", {
        count: data?.length || 0
      });
      
      return data || [];
    } catch (error) {
      logger.error("Failed fallback query", { error });
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
