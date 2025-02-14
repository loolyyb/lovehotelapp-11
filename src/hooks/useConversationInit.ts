
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseConversationInitProps {
  conversationId: string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setCurrentUserId: React.Dispatch<React.SetStateAction<string | null>>;
  setOtherUser: React.Dispatch<React.SetStateAction<any>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useConversationInit = ({
  conversationId,
  setMessages,
  setCurrentUserId,
  setOtherUser,
  setIsLoading,
}: UseConversationInitProps) => {
  const getCurrentUser = async () => {
    try {
      setMessages([]); 
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        setIsLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      // Faire les deux requêtes en parallèle pour optimiser le chargement
      const [profileResponse, conversationResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single(),
        
        supabase
          .from('conversations')
          .select(`
            *,
            user1:profiles!conversations_user1_profile_fkey(*),
            user2:profiles!conversations_user2_profile_fkey(*)
          `)
          .eq('id', conversationId)
          .single()
      ]);

      if (profileResponse.error) {
        console.error("Error fetching profile:", profileResponse.error);
        setIsLoading(false);
        return;
      }

      if (conversationResponse.error) {
        console.error("Error fetching conversation:", conversationResponse.error);
        setIsLoading(false);
        return;
      }

      const conversation = conversationResponse.data;
      if (conversation) {
        const otherUserData = conversation.user1.id === profileResponse.data.id 
          ? conversation.user2 
          : conversation.user1;
        setOtherUser(otherUserData);
      }

    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      setIsLoading(false);
    }
  };

  return { getCurrentUser };
};
