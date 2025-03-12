
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

    // Simplify the main query - just get messages first
    let messagesQuery = supabase
      .from("messages")
      .select("*")
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

    // If we have messages, get the related profile and conversation data
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
    // Get unique sender IDs and conversation IDs
    const senderIds = [...new Set(messages.map(msg => msg.sender_id))];
    const conversationIds = [...new Set(messages.map(msg => msg.conversation_id))];
    
    // Fetch profiles for senders in one query
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .in("id", senderIds);
    
    // Fetch conversations in one query
    const { data: conversations } = await supabase
      .from("conversations")
      .select(`
        id, 
        user1_id, 
        user2_id
      `)
      .in("id", conversationIds);
    
    // Create maps for quick lookups
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => profileMap.set(profile.id, profile));
    }
    
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
    
    // Enrich messages with profile and conversation data
    return messages.map(message => {
      const conversation = conversationMap.get(message.conversation_id);
      const sender = profileMap.get(message.sender_id) || { 
        id: message.sender_id, 
        username: 'Utilisateur inconnu', 
        full_name: null,
        avatar_url: null 
      };
      
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
        sender,
        recipient,
        conversation
      };
    });
  } catch (error) {
    console.error("Error enriching messages with profile data:", error);
    return messages.map(message => ({
      ...message,
      sender: { id: message.sender_id, username: 'Utilisateur inconnu' },
      recipient: { username: 'Utilisateur inconnu' }
    }));
  }
}

/**
 * Fetches conversation messages for a specific conversation
 */
export const fetchConversationMessages = async (conversationId: string) => {
  try {
    // First fetch the basic message data
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Then enrich with sender data
    return await enrichMessagesWithProfileData(messages || []);
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
