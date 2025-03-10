
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";
import { AlertService } from "@/services/AlertService";

/**
 * Finds all conversations for a given profile ID with detailed information
 * @param profileId The profile ID to find conversations for
 * @returns Array of conversations with other user details and messages
 */
export const findConversationsByProfileId = async (profileId: string) => {
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
    
    // Get the latest message times for each conversation using our new view
    const { data: latestMessageTimes, error: timesError } = await supabase
      .from('latest_message_times')
      .select('conversation_id, latest_message_time');
      
    if (timesError) {
      logger.error("Error fetching latest message times", {
        error: timesError,
        component: "findConversationsByProfileId"
      });
      // Continue with the original approach if the view query fails
    }
    
    // Create a map of conversation_id to latest_message_time
    const messageTimeMap = new Map();
    if (latestMessageTimes) {
      latestMessageTimes.forEach(item => {
        messageTimeMap.set(item.conversation_id, item.latest_message_time);
      });
    }
    
    // Try to get conversations with two separate queries for better performance
    // Query 1: Get conversations where user is user1_id
    const { data: conversationsAsUser1, error: user1Error } = await supabase
      .from('conversations')
      .select(`
        id, 
        status,
        blocked_by,
        user1_id,
        user2_id,
        created_at,
        updated_at,
        user2:profiles!conversations_user2_id_fkey(
          id, 
          username, 
          avatar_url, 
          full_name
        )
      `)
      .eq('user1_id', profileId)
      .eq('status', 'active');
      
    if (user1Error) {
      logger.error("Error fetching conversations as user1", {
        error: user1Error,
        component: "findConversationsByProfileId"
      });
      throw user1Error;
    }
    
    // Query 2: Get conversations where user is user2_id
    const { data: conversationsAsUser2, error: user2Error } = await supabase
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
        )
      `)
      .eq('user2_id', profileId)
      .eq('status', 'active');
      
    if (user2Error) {
      logger.error("Error fetching conversations as user2", {
        error: user2Error,
        component: "findConversationsByProfileId"
      });
      throw user2Error;
    }
    
    // Combine both result sets
    let allConversations: any[] = [];
    
    // Process conversations where user is user1_id
    if (conversationsAsUser1) {
      allConversations = allConversations.concat(
        conversationsAsUser1.map(conv => ({
          id: conv.id,
          status: conv.status,
          blocked_by: conv.blocked_by,
          otherUser: conv.user2,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          latest_message_time: messageTimeMap.get(conv.id) || conv.updated_at
        }))
      );
    }
    
    // Process conversations where user is user2_id
    if (conversationsAsUser2) {
      allConversations = allConversations.concat(
        conversationsAsUser2.map(conv => ({
          id: conv.id,
          status: conv.status,
          blocked_by: conv.blocked_by,
          otherUser: conv.user1,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          latest_message_time: messageTimeMap.get(conv.id) || conv.updated_at
        }))
      );
    }
    
    // Sort by latest message time (newest first)
    allConversations.sort((a, b) => {
      const timeA = new Date(a.latest_message_time).getTime();
      const timeB = new Date(b.latest_message_time).getTime();
      return timeB - timeA;
    });
    
    logger.info(`Found ${allConversations.length} conversations for profile ${profileId}`, {
      component: "findConversationsByProfileId"
    });
    
    // Add latest message information if needed
    // This could be optimized with a separate query to get the latest message for each conversation
    if (allConversations.length > 0) {
      const { data: latestMessages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          content,
          created_at,
          read_at,
          sender_id
        `)
        .in('conversation_id', allConversations.map(c => c.id))
        .order('created_at', { ascending: false });
        
      if (messagesError) {
        logger.error("Error fetching latest messages", {
          error: messagesError,
          component: "findConversationsByProfileId"
        });
        // Continue without latest messages data
      } else if (latestMessages) {
        // Group messages by conversation
        const messagesByConversation = new Map();
        latestMessages.forEach(msg => {
          if (!messagesByConversation.has(msg.conversation_id)) {
            messagesByConversation.set(msg.conversation_id, msg);
          }
        });
        
        // Add latest message to each conversation
        allConversations = allConversations.map(conv => {
          const latestMessage = messagesByConversation.get(conv.id);
          return {
            ...conv,
            latestMessage: latestMessage || null,
            hasUnread: latestMessage ? 
              (latestMessage.sender_id !== profileId && !latestMessage.read_at) : 
              false
          };
        });
      }
    }
    
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
