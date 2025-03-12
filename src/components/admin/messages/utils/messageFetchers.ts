
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Fetches messages for admin with pagination and search
 */
export const fetchMessages = async (
  currentPage: number,
  debouncedSearchTerm: string,
  MESSAGES_PER_PAGE: number
) => {
  console.log("Fetching messages for page:", currentPage, "search:", debouncedSearchTerm);
  
  try {
    // Build the base query to get total count
    let countQuery = supabase
      .from("messages")
      .select("*", { count: "exact", head: true });
      
    // Apply search filter if provided
    if (debouncedSearchTerm) {
      countQuery = countQuery.ilike('content', `%${debouncedSearchTerm}%`);
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      throw new Error(`Error fetching message count: ${countError.message}`);
    }

    // Build the main query
    let messagesQuery = supabase
      .from("messages")
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, full_name, avatar_url),
        conversation:conversations!messages_conversation_id_fkey(
          id,
          user1_id,
          user2_id,
          receiver1:profiles!conversations_user1_id_fkey(id, username, full_name),
          receiver2:profiles!conversations_user2_id_fkey(id, username, full_name)
        )
      `)
      .order("created_at", { ascending: false });
    
    // Apply search filter if provided
    if (debouncedSearchTerm) {
      messagesQuery = messagesQuery.ilike('content', `%${debouncedSearchTerm}%`);
    }
    
    // Apply pagination
    messagesQuery = messagesQuery.range(
      (currentPage - 1) * MESSAGES_PER_PAGE, 
      currentPage * MESSAGES_PER_PAGE - 1
    );

    const { data: messages, error: messagesError } = await messagesQuery;

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw messagesError;
    }

    // Process the messages and handle potential null values
    const processedMessages = messages?.map(message => {
      // Safely access conversation data with defaults if null
      const conversation = message.conversation || { 
        id: null,
        user1_id: null, 
        user2_id: null
      };
      
      let recipient = null;

      // Only try to determine recipient if we have valid sender and conversation data
      if (message.sender_id && conversation) {
        // Handle the case where receiver1 or receiver2 might be null
        if (conversation.user1_id === message.sender_id && conversation.receiver2) {
          recipient = conversation.receiver2;
        } else if (conversation.user2_id === message.sender_id && conversation.receiver1) {
          recipient = conversation.receiver1;
        }
        
        // If we still couldn't determine the recipient, create a placeholder
        if (!recipient) {
          recipient = { 
            id: null, 
            username: 'Utilisateur inconnu', 
            full_name: null 
          };
        }
      }

      return {
        ...message,
        recipient,
        // Ensure sender exists even if null
        sender: message.sender || { 
          id: null, 
          username: 'Utilisateur inconnu', 
          full_name: null, 
          avatar_url: null 
        }
      };
    }) || [];
    
    return { messages: processedMessages, totalCount: count || 0 };
  } catch (error) {
    console.error("Error in fetchMessages:", error);
    throw error;
  }
};

/**
 * Fetches conversation messages for a specific conversation
 */
export const fetchConversationMessages = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    throw error;
  }
};

/**
 * Marks a message as read
 */
export const markMessageAsRead = async (messageId: string) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
};
