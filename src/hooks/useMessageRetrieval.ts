
import { supabase } from "@/integrations/supabase/client";

interface UseMessageRetrievalProps {
  conversationId: string;
  currentUserId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  toast: any;
}

export const useMessageRetrieval = ({ 
  conversationId, 
  currentUserId, 
  setMessages, 
  toast 
}: UseMessageRetrievalProps) => {
  const fetchMessages = async () => {
    try {
      console.log("Fetching messages for conversation:", conversationId);
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      
      console.log("Fetched messages:", messages);
      setMessages(messages || []);
      if (messages?.length > 0) {
        markMessagesAsRead();
      }
    } catch (error: any) {
      console.error("Error in fetchMessages:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les messages",
      });
    }
  };

  const markMessagesAsRead = async () => {
    if (!currentUserId) {
      console.log("No current user ID, skipping mark as read");
      return;
    }

    try {
      console.log("Marking messages as read for user:", currentUserId);
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId)
        .is('read_at', null);

      if (error) {
        console.error("Error marking messages as read:", error);
      }
    } catch (error) {
      console.error("Error in markMessagesAsRead:", error);
    }
  };

  return { fetchMessages, markMessagesAsRead };
};
