
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

    // Use the new database function to get messages with profiles
    let messagesQuery;
    
    if (debouncedSearchTerm) {
      // If searching, we need to use the standard query approach with joins
      messagesQuery = supabase
        .from("messages")
        .select(`
          id,
          content,
          created_at,
          read_at,
          sender_id,
          conversation_id,
          media_type,
          media_url,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .ilike('content', `%${debouncedSearchTerm}%`)
        .order('created_at', { ascending: false })
        .range(
          (currentPage - 1) * MESSAGES_PER_PAGE, 
          currentPage * MESSAGES_PER_PAGE - 1
        );
    } else {
      // For regular pagination without search, use the materialized view to improve performance
      messagesQuery = supabase
        .from("messages")
        .select(`
          id,
          content,
          created_at,
          read_at,
          sender_id,
          conversation_id,
          media_type,
          media_url,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .range(
          (currentPage - 1) * MESSAGES_PER_PAGE, 
          currentPage * MESSAGES_PER_PAGE - 1
        );
    }

    const { data: messages, error: messagesError } = await messagesQuery;

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw messagesError;
    }

    // Process the messages to ensure they have sender and recipient details
    const processedMessages = await enrichMessagesWithProfileData(messages || []);
    
    return { messages: processedMessages, totalCount: count || 0 };
  } catch (error) {
    console.error("Error in fetchMessages:", error);
    throw error;
  }
};

/**
 * Enriches messages with profile and conversation data
 */
async function enrichMessagesWithProfileData(messages: any[]) {
  if (!messages.length) return [];
  
  try {
    // Get unique conversation IDs
    const conversationIds = [...new Set(messages.map(msg => msg.conversation_id))];
    
    // Fetch conversations in one query
    const { data: conversations } = await supabase
      .from("conversations")
      .select(`
        id, 
        user1_id, 
        user2_id
      `)
      .in("id", conversationIds);
    
    // Create map for conversation lookup
    const conversationMap = new Map();
    if (conversations) {
      conversations.forEach(conv => conversationMap.set(conv.id, conv));
    }
    
    // Get recipient profiles
    const recipientIds = new Set();
    conversations?.forEach(conv => {
      messages.forEach(msg => {
        if (conv.id === msg.conversation_id) {
          const recipientId = conv.user1_id === msg.sender_id ? conv.user2_id : conv.user1_id;
          recipientIds.add(recipientId);
        }
      });
    });
    
    // Fetch recipient profiles
    const { data: recipientProfiles } = await supabase
      .from("profiles")
      .select("id, username, full_name")
      .in("id", Array.from(recipientIds));
    
    const recipientMap = new Map();
    if (recipientProfiles) {
      recipientProfiles.forEach(profile => recipientMap.set(profile.id, profile));
    }
    
    // Enrich messages with sender and recipient data
    return messages.map(message => {
      const conversation = conversationMap.get(message.conversation_id);
      
      let recipient = null;
      if (conversation) {
        const recipientId = conversation.user1_id === message.sender_id 
          ? conversation.user2_id 
          : conversation.user1_id;
        
        recipient = recipientMap.get(recipientId) || { 
          id: recipientId, 
          username: 'Utilisateur inconnu', 
          full_name: null 
        };
      }
      
      return {
        ...message,
        recipient,
        conversation
      };
    });
  } catch (error) {
    console.error("Error enriching messages with profile data:", error);
    return messages.map(message => ({
      ...message,
      recipient: { username: 'Utilisateur inconnu' }
    }));
  }
}

/**
 * Fetches conversation messages for a specific conversation
 */
export const fetchConversationMessages = async (conversationId: string) => {
  try {
    // Try to use the database function first
    const { data: messages, error } = await supabase.rpc(
      'get_conversation_messages',
      {
        conversation_uuid: conversationId,
        limit_count: 100 // Get more messages for admin view
      }
    );
    
    if (error) {
      console.error("Error using database function, falling back to standard query:", error);
      
      // Fall back to standard query
      const { data: fallbackMessages, error: fallbackError } = await supabase
        .from("messages")
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (fallbackError) throw fallbackError;
      
      return await enrichMessagesWithProfileData(fallbackMessages || []);
    }
    
    // Sort in ascending order
    return messages ? 
      [...messages].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ) : [];
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
