
import { useState, useEffect } from "react";
import { supabase, safeQueryResult } from "@/integrations/supabase/client";

export function useConversationsFetcher(currentProfileId: string | null) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
      // Now fetch conversations with unique aliases for the profiles to avoid the duplicate table error
      const { data, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id, 
          created_at,
          updated_at,
          status,
          blocked_by,
          user1_id,
          user2_id,
          user1:profiles!conversations_user1_id_fkey (
            id, 
            full_name,
            username,
            avatar_url
          ),
          user2:profiles!conversations_user2_id_fkey (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .or(`user1_id.eq.${currentProfileId},user2_id.eq.${currentProfileId}`)
        .eq('status', 'active');

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError);
        throw new Error(conversationsError.message);
      }

      // Ensure type safety and log detailed results
      const typedData = safeQueryResult<any>(data);
      console.log("Conversations fetch result:", {
        success: true,
        count: typedData.length,
        profileId: currentProfileId,
        conversations: typedData.map(c => ({ 
          id: c.id, 
          user1_id: c.user1_id, 
          user2_id: c.user2_id,
          status: c.status
        }))
      });
      
      // Log more detailed info if no conversations found
      if (typedData.length === 0) {
        console.log("No conversations found for profile:", currentProfileId);
        
        // Additional debug: Check if there are any conversations at all for this user without the status filter
        const { data: allConvs, error: allConvsError } = await supabase
          .from('conversations')
          .select('id, status, user1_id, user2_id, blocked_by')
          .or(`user1_id.eq.${currentProfileId},user2_id.eq.${currentProfileId}`);
          
        if (!allConvsError && allConvs) {
          console.log("All conversations (including inactive):", {
            count: allConvs.length,
            conversations: allConvs
          });
          
          // If we found conversations but they're not active, we should show them
          if (allConvs.length > 0) {
            const inactiveConversations = allConvs.filter(c => c.status !== 'active');
            if (inactiveConversations.length > 0) {
              console.log("Found inactive conversations:", inactiveConversations);
              
              // Include inactive conversations in the results if that's all we have
              if (typedData.length === 0 && inactiveConversations.length > 0) {
                // Fetch full details for these conversations
                const { data: inactiveWithDetails } = await supabase
                  .from('conversations')
                  .select(`
                    id, 
                    created_at,
                    updated_at,
                    status,
                    blocked_by,
                    user1_id,
                    user2_id,
                    user1:profiles!conversations_user1_id_fkey (
                      id, 
                      full_name,
                      username,
                      avatar_url
                    ),
                    user2:profiles!conversations_user2_id_fkey (
                      id,
                      full_name,
                      username,
                      avatar_url
                    )
                  `)
                  .in('id', inactiveConversations.map(c => c.id));
                  
                if (inactiveWithDetails) {
                  console.log("Adding inactive conversations to results");
                  const allData = [...typedData, ...safeQueryResult<any>(inactiveWithDetails)];
                  setConversations(allData);
                  setError(null);
                  setIsLoading(false);
                  return allData;
                }
              }
            }
          }
        }
      }
      
      setConversations(typedData);
      setError(null);
      return typedData;
    } catch (error: any) {
      console.error("Error in fetchConversations:", error);
      setError(error.message || "Erreur lors du chargement des conversations");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    conversations,
    setConversations,
    isLoading,
    error,
    fetchConversations
  };
}
