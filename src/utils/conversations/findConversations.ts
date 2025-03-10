
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
    
    // Try to get conversations with two separate queries first
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
        updated_at
      `)
      .eq('user1_id', profileId)
      .eq('status', 'active');
      
    if (user1Error) {
      logger.error("Error fetching conversations where user is user1_id", {
        error: user1Error,
        profileId,
        component: "findConversationsByProfileId"
      });
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
        updated_at
      `)
      .eq('user2_id', profileId)
      .eq('status', 'active');
      
    if (user2Error) {
      logger.error("Error fetching conversations where user is user2_id", {
        error: user2Error,
        profileId,
        component: "findConversationsByProfileId"
      });
    }
    
    // Combine the results
    let conversations = [];
    
    if (conversationsAsUser1) {
      conversations = [...conversationsAsUser1];
    }
    
    if (conversationsAsUser2) {
      // Add only non-duplicate conversations from user2 query
      const existingIds = new Set(conversations.map(c => c.id));
      const uniqueConversationsAsUser2 = conversationsAsUser2.filter(c => !existingIds.has(c.id));
      conversations = [...conversations, ...uniqueConversationsAsUser2];
    }
    
    // Add more detailed logging to help debug
    if (conversations.length === 0) {
      logger.warn(`No conversations found for profile ${profileId} using separate queries`, {
        component: "findConversationsByProfileId",
        user1QueryError: !!user1Error,
        user2QueryError: !!user2Error
      });
      
      // Fallback to the OR query as a last attempt
      const { data: fallbackConversations, error: fallbackError } = await supabase
        .from('conversations')
        .select(`
          id, 
          status,
          blocked_by,
          user1_id,
          user2_id,
          created_at,
          updated_at
        `)
        .or(`user1_id.eq.${profileId},user2_id.eq.${profileId}`)
        .eq('status', 'active');
        
      if (fallbackError) {
        logger.error("Error in fallback OR query for conversations", {
          error: fallbackError,
          profileId,
          component: "findConversationsByProfileId"
        });
      } else if (fallbackConversations && fallbackConversations.length > 0) {
        logger.info(`Found ${fallbackConversations.length} conversations using fallback OR query`, {
          component: "findConversationsByProfileId"
        });
        conversations = fallbackConversations;
      } else {
        logger.warn(`No conversations returned from fallback query for profile ${profileId}`, {
          component: "findConversationsByProfileId"
        });
        return [];
      }
    } else {
      logger.info(`Found ${conversations.length} conversations for profile ${profileId} using separate queries`, {
        component: "findConversationsByProfileId",
        conversationIds: conversations.map(c => c.id)
      });
    }
    
    // Process each conversation to include other user details and recent messages
    const conversationsWithDetails = await Promise.all(conversations.map(async (conversation) => {
      try {
        const otherUserId = conversation.user1_id === profileId 
          ? conversation.user2_id 
          : conversation.user1_id;
        
        // Get the other user's profile
        const { data: otherUserProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', otherUserId)
          .maybeSingle();
          
        if (profileError) {
          logger.error(`Error fetching profile for user ${otherUserId}:`, {
            error: profileError,
            component: "findConversationsByProfileId"
          });
          
          // Return conversation with placeholder user data
          return {
            ...conversation,
            otherUser: { id: otherUserId, username: 'Utilisateur inconnu' },
            messages: [],
            latest_message_time: conversation.updated_at || conversation.created_at
          };
        }
        
        // Get the latest messages for this conversation
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('id, content, created_at, sender_id, read_at')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (messagesError) {
          logger.error(`Error fetching messages for conversation ${conversation.id}:`, {
            error: messagesError,
            component: "findConversationsByProfileId"
          });
          
          // Return conversation with user data but no messages
          return {
            ...conversation,
            otherUser: otherUserProfile || { id: otherUserId, username: 'Utilisateur inconnu' },
            messages: [],
            latest_message_time: conversation.updated_at || conversation.created_at
          };
        }
        
        // Find the latest message timestamp or fall back to conversation updated_at/created_at
        const latestMessageTime = messages && messages.length > 0 
          ? messages[0].created_at 
          : conversation.updated_at || conversation.created_at;
        
        // Return full conversation data with latest message timestamp
        return {
          ...conversation,
          otherUser: otherUserProfile || { id: otherUserId, username: 'Utilisateur inconnu' },
          messages: messages || [],
          latest_message_time: latestMessageTime
        };
      } catch (error) {
        logger.error(`Error processing conversation ${conversation.id}:`, {
          error,
          component: "findConversationsByProfileId"
        });
        
        // Return basic conversation data on error
        return {
          ...conversation,
          otherUser: { id: conversation.user1_id === profileId ? conversation.user2_id : conversation.user1_id, username: 'Erreur' },
          messages: [],
          latest_message_time: conversation.updated_at || conversation.created_at
        };
      }
    }));
    
    // Sort conversations by the latest message time, most recent first
    const sortedConversations = conversationsWithDetails.sort((a, b) => {
      const timeA = new Date(a.latest_message_time).getTime();
      const timeB = new Date(b.latest_message_time).getTime();
      return timeB - timeA; // Descending order (newest first)
    });
    
    logger.info(`Successfully processed ${sortedConversations.length} conversations with details and sorted by latest message`, {
      component: "findConversationsByProfileId"
    });
    
    return sortedConversations;
  } catch (error) {
    logger.error('Error in findConversationsByProfileId:', {
      error,
      profileId,
      component: "findConversationsByProfileId"
    });
    AlertService.captureException(error);
    throw error;
  }
};
