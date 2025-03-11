
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";

// Define an interface for the conversation with all necessary properties
interface ConversationWithOtherUser {
  id: string;
  status: string;
  blocked_by: string | null;
  otherUser: any;
  created_at: string;
  updated_at: string;
  latest_message_time: string;
  latestMessage?: any | null;
  hasUnread?: boolean;
}

// Define more specific types for the database responses
interface LatestMessageTime {
  latest_message_time: string;
}

/**
 * Finds all conversations for a given profile ID with detailed information
 * @param profileId The profile ID to find conversations for
 * @returns Array of conversations with other user details and messages
 */
export const findConversationsByProfileId = async (profileId: string): Promise<ConversationWithOtherUser[]> => {
  if (!profileId) {
    logger.error("No profile ID provided to findConversationsByProfileId", {
      component: "findConversationsByProfileId"
    });
    return [];
  }
  
  try {
    logger.info(`Finding conversations for profile: ${profileId}`, {
      component: "findConversationsByProfileId"
    });
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      logger.error("Authentication error in findConversationsByProfileId", {
        error: authError,
        component: "findConversationsByProfileId"
      });
      throw new Error("Authentication error: " + authError.message);
    }
    
    if (!user) {
      logger.error("No authenticated user found", {
        component: "findConversationsByProfileId"
      });
      throw new Error("No authenticated user found");
    }
    
    // More efficient query - joining the view directly to get data in a single query
    const { data: conversationsWithTimes, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        id, 
        status,
        blocked_by,
        user1_id,
        user2_id,
        created_at,
        updated_at,
        user1:profiles!conversations_user1_id_fkey(
          id, 
          username, 
          avatar_url, 
          full_name
        ),
        user2:profiles!conversations_user2_id_fkey(
          id, 
          username, 
          avatar_url, 
          full_name
        ),
        latest_message:latest_message_times!inner(latest_message_time)
      `)
      .or(`user1_id.eq.${profileId},user2_id.eq.${profileId}`)
      .eq('status', 'active')
      .order('latest_message_time', { foreignTable: 'latest_message_times', ascending: false });
      
    if (conversationsError) {
      logger.error("Error fetching conversations", {
        error: conversationsError,
        component: "findConversationsByProfileId"
      });
      throw conversationsError;
    }
  
  // Transform results to match expected format
  const allConversations: ConversationWithOtherUser[] = (conversationsWithTimes || []).map(conv => {
    const otherUser = conv.user1_id === profileId ? conv.user2 : conv.user1;
    
    // Fix the latest_message_time access - properly handle the latest_message object
    let latestMessageTime = conv.updated_at; // Default to conversation updated_at time
    
    // Check if latest_message exists and has the right structure
    if (conv.latest_message && typeof conv.latest_message === 'object') {
      // Handle both possible structures (direct object or array with first element)
      if (Array.isArray(conv.latest_message)) {
        // If it's an array, take the first element if it exists
        if (conv.latest_message.length > 0) {
          const latestMsg = conv.latest_message[0] as LatestMessageTime;
          if (latestMsg && latestMsg.latest_message_time) {
            latestMessageTime = latestMsg.latest_message_time;
          }
        }
      } else {
        // If it's an object, access the property directly
        const msgObj = conv.latest_message as LatestMessageTime;
        if (msgObj && msgObj.latest_message_time) {
          latestMessageTime = msgObj.latest_message_time;
        }
      }
    }
    
    return {
      id: conv.id,
      status: conv.status,
      blocked_by: conv.blocked_by,
      otherUser,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      latest_message_time: latestMessageTime,
      latestMessage: null, // Will be populated later
      hasUnread: false // Will be populated later
    };
  });
  
    logger.info(`Found ${allConversations.length} conversations for profile ${profileId}`, {
      component: "findConversationsByProfileId"
    });
    
    // Only fetch latest messages if we have conversations
    if (allConversations.length > 0) {
      try {
        // Get all conversation IDs to fetch messages
        const conversationIds = allConversations.map(c => c.id);
        
        // Efficient query to get latest message per conversation using a window function
        const { data: latestMessages, error: messagesError } = await supabase
          .rpc('get_latest_messages_per_conversation', { 
            profile_id: profileId,
            conversation_ids: conversationIds
          });
          
        if (messagesError) {
          logger.error("Error fetching latest messages", {
            error: messagesError,
            component: "findConversationsByProfileId"
          });
          // Continue without latest messages
        } else if (latestMessages) {
          // Create a Map to find the latest message for each conversation efficiently
          const messagesByConversation = new Map();
          latestMessages.forEach(msg => {
            messagesByConversation.set(msg.conversation_id, msg);
          });
          
          // Add latest message to each conversation
          allConversations.forEach(conv => {
            const latestMessage = messagesByConversation.get(conv.id);
            conv.latestMessage = latestMessage || null;
            conv.hasUnread = latestMessage ? 
              (latestMessage.sender_id !== profileId && !latestMessage.read_at) : 
              false;
          });
        }
      } catch (error) {
        logger.error("Error processing latest messages", {
          error,
          component: "findConversationsByProfileId"
        });
        // Continue without latest messages
      }
    }
    
    // Make sure conversations are sorted by latest_message_time in descending order
    allConversations.sort((a, b) => {
      // Use new Date() to convert string dates to comparable Date objects
      const dateA = new Date(a.latest_message_time);
      const dateB = new Date(b.latest_message_time);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
    
    return allConversations;
  } catch (error: any) {
    logger.error("Exception in findConversationsByProfileId", {
      error,
      component: "findConversationsByProfileId"
    });
    AlertService.captureException(error);
    return [];
  }
};
