
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseConversationInitProps {
  conversationId: string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setCurrentUserId: React.Dispatch<React.SetStateAction<string | null>>;
  setOtherUser: React.Dispatch<React.SetStateAction<any>>;
}

export const useConversationInit = ({
  conversationId,
  setMessages,
  setCurrentUserId,
  setOtherUser,
}: UseConversationInitProps) => {
  const getCurrentUser = async () => {
    try {
      setMessages([]); // Reset messages when changing conversation
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return;
      }
      console.log("Current user ID:", user.id);
      setCurrentUserId(user.id);

      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching current user profile:", profileError);
        return;
      }

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!conversations_user1_profile_fkey(*),
          user2:profiles!conversations_user2_profile_fkey(*)
        `)
        .eq('id', conversationId)
        .single();

      if (convError) {
        console.error("Error fetching conversation:", convError);
        return;
      }

      if (conversation) {
        console.log("Fetched conversation:", conversation);
        const otherUserData = conversation.user1.id === currentUserProfile.id 
          ? conversation.user2 
          : conversation.user1;
        console.log("Other user data:", otherUserData);
        setOtherUser(otherUserData);
      }
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
    }
  };

  return { getCurrentUser };
};
