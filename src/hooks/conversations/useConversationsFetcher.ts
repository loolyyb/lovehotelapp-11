
import { useState, useEffect } from "react";
import { supabase, safeQueryResult } from "@/integrations/supabase/client";

export function useConversationsFetcher(currentProfileId: string | null) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const DEBUG_MODE = true; // Enable for verbose logging

  // Auto-fetch when profile ID changes
  useEffect(() => {
    if (currentProfileId) {
      console.log("Profile ID changed, fetching conversations", { profileId: currentProfileId });
      fetchConversations();
    }
  }, [currentProfileId]);

  const fetchConversations = async () => {
    if (!currentProfileId) {
      console.warn("No profile ID provided, cannot fetch conversations");
      setError("Vous devez être connecté pour voir vos conversations");
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching conversations for profile ID:", currentProfileId);
      
      // First, check if the profile exists
      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('id', currentProfileId)
        .maybeSingle();
        
      if (profileError) {
        console.error("Error checking profile:", profileError);
        throw new Error("Erreur lors de la vérification du profil");
      }
      
      if (!profileCheck) {
        console.warn("Profile not found in database:", currentProfileId);
        throw new Error("Profil introuvable. Veuillez vous reconnecter.");
      }

      console.log("Profile found:", profileCheck);
      
      // Enhanced fetching approach
      // First check if we can access with auth.uid() directly
      const { data: userConversations, error: userConvError } = await supabase
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
        .or(`user1_id.eq.${currentProfileId},user2_id.eq.${currentProfileId}`)
        .order('updated_at', { ascending: false });
      
      if (userConvError) {
        console.error("Error with user conversation fetch:", userConvError);
      } else {
        console.log("User conversations:", {
          count: userConversations?.length || 0,
          conversations: userConversations
        });
      }
      
      // If no conversations found with the direct query, try explicit join approach
      if (!userConversations || userConversations.length === 0) {
        console.log("No conversations found with direct query, trying join approach");
        
        const { data: joinData, error: joinError } = await supabase
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
          .or(`user1_id.eq.${currentProfileId},user2_id.eq.${currentProfileId}`)
          .neq('status', 'deleted'); // Exclude deleted conversations
        
        if (joinError) {
          console.error("Error with join query:", joinError);
        } else {
          console.log("Join query results:", {
            count: joinData?.length || 0,
            conversations: joinData
          });
          
          if (joinData && joinData.length > 0) {
            // We have conversations from the join approach
            const withProfiles = await fetchProfilesForConversations(joinData, currentProfileId);
            setConversations(withProfiles);
            setIsLoading(false);
            return withProfiles;
          }
        }
      } else {
        // We have conversations from the direct query
        const withProfiles = await fetchProfilesForConversations(userConversations, currentProfileId);
        setConversations(withProfiles);
        setIsLoading(false);
        return withProfiles;
      }
      
      // Fallback approach: fetch each profile separately
      console.log("No conversations found with standard queries, trying alternative approach");
      
      // Fetch users who might be in conversations with current user
      const { data: potentialUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .neq('id', currentProfileId)
        .limit(20);
        
      if (usersError) {
        console.error("Error fetching potential users:", usersError);
      } else if (potentialUsers && potentialUsers.length > 0) {
        console.log("Found potential conversation partners:", potentialUsers.length);
        
        // Check for conversations with each user
        const conversationPromises = potentialUsers.map(user => 
          checkForConversation(currentProfileId, user.id)
        );
        
        const results = await Promise.all(conversationPromises);
        const foundConversations = results
          .filter(result => result.conversation != null)
          .map(result => ({
            ...result.conversation,
            otherUser: result.otherUser
          }));
          
        console.log("Found conversations from individual checks:", foundConversations.length);
        
        if (foundConversations.length > 0) {
          setConversations(foundConversations);
          setIsLoading(false);
          return foundConversations;
        }
      }
      
      // If we get here, we truly have no conversations
      console.log("No conversations found with any approach");
      setConversations([]);
      setIsLoading(false);
      return [];
      
    } catch (error: any) {
      console.error("Error in fetchConversations:", error);
      setError(error.message || "Erreur lors du chargement des conversations");
      setIsLoading(false);
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
          console.error("Error fetching profile for conversation:", profileError);
          return {...conversation, otherUser: null};
        }
        
        return {...conversation, otherUser};
      })
    );
    
    return result;
  };
  
  // Helper function to check for a conversation between two users
  const checkForConversation = async (user1: string, user2: string) => {
    // Try first direction (user1 -> user2)
    const { data: conv1, error: error1 } = await supabase
      .from('conversations')
      .select('*')
      .eq('user1_id', user1)
      .eq('user2_id', user2)
      .maybeSingle();
      
    if (!error1 && conv1) {
      const { data: otherUser } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', user2)
        .maybeSingle();
        
      return { conversation: conv1, otherUser };
    }
    
    // Try other direction (user2 -> user1)
    const { data: conv2, error: error2 } = await supabase
      .from('conversations')
      .select('*')
      .eq('user1_id', user2)
      .eq('user2_id', user1)
      .maybeSingle();
      
    if (!error2 && conv2) {
      const { data: otherUser } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', user2)
        .maybeSingle();
        
      return { conversation: conv2, otherUser };
    }
    
    return { conversation: null, otherUser: null };
  };

  return {
    conversations,
    setConversations,
    isLoading,
    error,
    fetchConversations
  };
}
