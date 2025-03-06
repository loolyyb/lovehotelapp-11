
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
      
      // First fetch ALL conversations regardless of status to debug
      const { data: allStatusConvs, error: allStatusError } = await supabase
        .from('conversations')
        .select(`
          id, 
          status,
          blocked_by,
          user1_id,
          user2_id
        `)
        .or(`user1_id.eq.${currentProfileId},user2_id.eq.${currentProfileId}`);
      
      if (allStatusError) {
        console.error("Error fetching all status conversations:", allStatusError);
      } else {
        console.log("All conversations (any status):", {
          count: allStatusConvs?.length || 0,
          conversations: allStatusConvs
        });
      }
      
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
        .or(`user1_id.eq.${currentProfileId},user2_id.eq.${currentProfileId}`);
        // Note: Status filter removed to see ALL conversations

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError);
        throw new Error(conversationsError.message);
      }

      // Ensure type safety and log detailed results
      const typedData = safeQueryResult<any>(data);
      console.log("All fetched conversations:", {
        success: true,
        count: typedData.length,
        profileId: currentProfileId,
        conversations: typedData.map(c => ({ 
          id: c.id, 
          user1_id: c.user1_id, 
          user2_id: c.user2_id,
          status: c.status,
          blocked_by: c.blocked_by
        }))
      });
      
      // Filter active conversations
      const activeConversations = typedData.filter(c => c.status === 'active');
      console.log("Active conversations:", {
        count: activeConversations.length,
        conversations: activeConversations.map(c => ({ 
          id: c.id, 
          user1_id: c.user1_id, 
          user2_id: c.user2_id
        }))
      });
      
      // Filter inactive conversations
      const inactiveConversations = typedData.filter(c => c.status !== 'active');
      console.log("Inactive conversations:", {
        count: inactiveConversations.length,
        conversations: inactiveConversations.map(c => ({ 
          id: c.id, 
          status: c.status,
          user1_id: c.user1_id, 
          user2_id: c.user2_id,
          blocked_by: c.blocked_by
        }))
      });
      
      // Use active conversations if available, otherwise use all conversations
      // This ensures the user can see conversations even if they're not active
      if (activeConversations.length > 0) {
        setConversations(activeConversations);
        setError(null);
        setIsLoading(false);
        return activeConversations;
      } else {
        console.log("No active conversations found, using all conversations instead");
        setConversations(typedData);
        if (typedData.length > 0) {
          // If we have inactive conversations, show a warning
          console.log("Warning: Only inactive conversations found");
        } else {
          console.log("No conversations found for profile:", currentProfileId);
        }
        setError(null);
        setIsLoading(false);
        return typedData;
      }
    } catch (error: any) {
      console.error("Error in fetchConversations:", error);
      setError(error.message || "Erreur lors du chargement des conversations");
      setIsLoading(false);
      return [];
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
