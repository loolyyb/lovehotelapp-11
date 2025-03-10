
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
    
    // Use Promise.all to parallelize the two conversation queries
    const [latestMessageTimesResult, conversationsAsUser1Result, conversationsAsUser2Result] = await Promise.all([
      // 1. Get the latest message times from the view
      supabase.from('latest_message_times').select('conversation_id, latest_message_time'),
      
      // 2. Get conversations where user is user1_id
      supabase.from('conversations')
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
        .eq('status', 'active'),
        
      // 3. Get conversations where user is user2_id  
      supabase.from('conversations')
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
        .eq('status', 'active')
    ]);
    
    const { data: latestMessageTimes, error: timesError } = latestMessageTimesResult;
    const { data: conversationsAsUser1, error: user1Error } = conversationsAsUser1Result;
    const { data: conversationsAsUser2, error: user2Error } = conversationsAsUser2Result;
    
    if (timesError) {
      logger.error("Error fetching latest message times", {
        error: timesError,
        component: "findConversationsByProfileId"
      });
      // Continue without the message times data
    }
    
    if (user1Error) {
      logger.error("Error fetching conversations as user1", {
        error: user1Error,
        component: "findConversationsByProfileId"
      });
      // Continue with empty conversations as user1
    }
    
    if (user2Error) {
      logger.error("Error fetching conversations as user2", {
        error: user2Error,
        component: "findConversationsByProfileId"
      });
      // Continue with empty conversations as user2
    }
    
    // Create a map of conversation_id to latest_message_time
    const messageTimeMap = new Map();
    if (latestMessageTimes) {
      latestMessageTimes.forEach(item => {
        messageTimeMap.set(item.conversation_id, item.latest_message_time);
      });
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
    
    // Optimize sort for better performance
    allConversations.sort((a, b) => {
      // Convert once outside the comparison to avoid repeated conversions
      const timeA = new Date(a.latest_message_time).getTime();
      const timeB = new Date(b.latest_message_time).getTime();
      return timeB - timeA; // Newest first
    });
    
    logger.info(`Found ${allConversations.length} conversations for profile ${profileId}`, {
      component: "findConversationsByProfileId"
    });
    
    // Only fetch latest messages if we have conversations
    if (allConversations.length > 0) {
      try {
        // Get all conversation IDs to fetch messages
        const conversationIds = allConversations.map(c => c.id);
        
        // Efficient query to get latest message per conversation
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
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false });
          
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
      } catch (error) {
        logger.error("Error processing latest messages", {
          error,
          component: "findConversationsByProfileId"
        });
        // Continue without latest messages
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
