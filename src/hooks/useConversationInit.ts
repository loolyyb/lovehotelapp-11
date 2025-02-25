
import { supabase } from "@/integrations/supabase/client";

interface UseConversationInitProps {
  conversationId: string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setCurrentProfileId: React.Dispatch<React.SetStateAction<string | null>>;  // Ajout de cette prop
  setOtherUser: React.Dispatch<React.SetStateAction<any>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useConversationInit = ({
  conversationId,
  setMessages,
  setCurrentProfileId,
  setOtherUser,
  setIsLoading,
}: UseConversationInitProps) => {
  const getCurrentUser = async () => {
    if (!conversationId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCurrentProfileId(profile.id);
      }

      // Get initial messages directly to show something quickly
      const { data: initialMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20);

      if (initialMessages?.length) {
        setMessages(initialMessages);
      }

      // Fetch user profile and conversation details in parallel
      const { data: conversation } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!conversations_user1_profile_fkey(id, username, full_name, avatar_url),
          user2:profiles!conversations_user2_profile_fkey(id, username, full_name, avatar_url)
        `)
        .eq('id', conversationId)
        .single();

      if (conversation && profile) {
        const otherUserData = conversation.user1.id === profile.id 
          ? conversation.user2 
          : conversation.user1;
        setOtherUser(otherUserData);
      }

    } catch (error) {
      console.error("Error in getCurrentUser:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { getCurrentUser };
};
