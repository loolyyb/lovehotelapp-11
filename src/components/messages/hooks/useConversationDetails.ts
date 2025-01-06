import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useConversationDetails = (conversationId: string) => {
  const [otherUser, setOtherUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConversationDetails = async (userId: string) => {
    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!conversations_user1_id_fkey(*),
          user2:profiles!conversations_user2_id_fkey(*)
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      if (conversation) {
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .single();

        const otherUserData = conversation.user1.id === currentUserProfile?.id 
          ? conversation.user2 
          : conversation.user1;
          
        setOtherUser(otherUserData);
      }
    } catch (error) {
      console.error("Error fetching conversation details:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les détails de la conversation",
      });
    }
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Vous devez être connecté pour accéder aux messages",
          });
          return;
        }
        
        setCurrentUserId(user.id);
        await fetchConversationDetails(user.id);
      } catch (error) {
        console.error("Error in getCurrentUser:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations utilisateur",
        });
      }
    };

    getCurrentUser();
  }, [conversationId]);

  return {
    otherUser,
    currentUserId
  };
};