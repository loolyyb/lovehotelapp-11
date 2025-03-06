
import { supabase } from "@/integrations/supabase/client";

interface UseMessageRetrievalProps {
  conversationId: string;
  currentProfileId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  toast: any;
}

export const useMessageRetrieval = ({ 
  conversationId, 
  currentProfileId, 
  setMessages, 
  toast 
}: UseMessageRetrievalProps) => {
  const fetchMessages = async () => {
    try {
      console.log("Fetching messages for conversation:", conversationId);
      console.log("Current user profile ID:", currentProfileId);
      
      if (!conversationId) {
        console.error("No conversation ID provided");
        return;
      }
      
      // Vérifier d'abord si l'utilisateur est membre de cette conversation
      const { data: conversationCheck, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .or(`user1_id.eq.${currentProfileId},user2_id.eq.${currentProfileId}`)
        .single();
      
      if (conversationError) {
        console.error("Error checking conversation membership:", conversationError);
        if (conversationError.code !== 'PGRST116') { // not found error
          throw conversationError;
        }
        // Si l'utilisateur n'est pas membre de la conversation, ne pas récupérer les messages
        console.log("User is not a member of this conversation");
        setMessages([]);
        return;
      }
      
      if (!conversationCheck) {
        console.log("Conversation not found or user is not a member");
        setMessages([]);
        return;
      }
      
      console.log("User confirmed as member of conversation:", conversationCheck);
      
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read_at,
          sender_id,
          media_type,
          media_url,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            full_name
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      
      console.log("Fetched messages:", messages?.length || 0);
      if (messages && messages.length > 0) {
        console.log("First message:", messages[0]);
        console.log("Last message:", messages[messages.length - 1]);
      } else {
        console.log("No messages found for this conversation");
      }
      
      setMessages(messages || []);

      // Add delay before marking messages as read
      if (messages?.length > 0) {
        setTimeout(() => markMessagesAsRead(), 1000);
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
    if (!currentProfileId) {
      console.log("No current profile ID, skipping mark as read");
      return;
    }

    try {
      console.log("Marking messages as read for profile:", currentProfileId);
      
      // First check if there are any unread messages
      const { data: unreadMessages, error: checkError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentProfileId)
        .is('read_at', null);

      if (checkError) {
        console.error("Error checking unread messages:", checkError);
        throw checkError;
      }

      if (!unreadMessages || unreadMessages.length === 0) {
        console.log("No unread messages to mark");
        return;
      }

      console.log(`Found ${unreadMessages.length} unread messages to mark as read`);
      console.log("Unread message IDs:", unreadMessages.map(msg => msg.id));

      const { error: updateError } = await supabase
        .from('messages')
        .update({ 
          read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentProfileId)
        .is('read_at', null);

      if (updateError) {
        console.error("Error marking messages as read:", updateError);
        throw updateError;
      }

      console.log("Successfully marked messages as read");
    } catch (error) {
      console.error("Error in markMessagesAsRead:", error);
    }
  };

  return { fetchMessages, markMessagesAsRead };
};
