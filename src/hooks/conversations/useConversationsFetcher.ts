
import { useState } from "react";
import { supabase, safeQueryResult } from "@/integrations/supabase/client";

export function useConversationsFetcher(currentProfileId: string | null) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          profiles!conversations_user1_id_fkey (id, full_name, username, avatar_url),
          profiles!conversations_user2_id_fkey (id, full_name, username, avatar_url)
        `)
        .or(`user1_id.eq.${currentProfileId},user2_id.eq.${currentProfileId}`)
        .eq('status', 'active');

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError);
        throw new Error(conversationsError.message);
      }

      // Ensure type safety
      const typedData = safeQueryResult<any>(data);
      console.log("Fetched conversations:", typedData);
      
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
