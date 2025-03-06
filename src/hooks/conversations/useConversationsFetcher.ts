
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
        .select('id')
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
      
      // Now fetch conversations with proper table aliases to avoid the duplicate table error
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
          user1:profiles!conversations_user1_id_fkey (id, full_name, username, avatar_url),
          user2:profiles!conversations_user2_id_fkey (id, full_name, username, avatar_url)
        `)
        .or(`user1_id.eq.${currentProfileId},user2_id.eq.${currentProfileId}`)
        .eq('status', 'active');

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError);
        throw new Error(conversationsError.message);
      }

      // Ensure type safety
      const typedData = safeQueryResult<any>(data);
      console.info("Fetched conversations", { 
        component: "useConversationsFetcher",
        count: typedData.length,
        conversationIds: typedData.map(c => c.id)
      });
      
      if (typedData.length === 0) {
        console.info("Fetched conversations", { 
          component: "useConversations",
          count: 0
        });
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
