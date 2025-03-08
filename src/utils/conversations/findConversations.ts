
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";

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
    
    // FIX: Using a proper query format that works reliably with Supabase
    logger.info(`Fetching conversations for profile ID: ${profileId}`, {
      component: "findConversationsByProfileId"
    });
    
    // CRITICAL FIX: Use proper string format for OR filter
    const { data: conversations, error: conversationsError } = await supabase
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
      
    if (conversationsError) {
      logger.error("Error fetching conversations by profile ID:", {
        error: conversationsError,
        profileId,
        component: "findConversationsByProfileId"
      });
      throw new Error("Error fetching conversations: " + conversationsError.message);
    }
    
    // Add more detailed logging to help debug
    if (!conversations) {
      logger.warn(`No conversations returned from database for profile ${profileId}`, {
        component: "findConversationsByProfileId"
      });
      return [];
    }
    
    logger.info(`Found ${conversations.length} conversations for profile ${profileId}`, {
      component: "findConversationsByProfileId",
      conversationIds: conversations.map(c => c.id)
    });
    
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
            messages: []
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
            messages: []
          };
        }
        
        // Return full conversation data
        return {
          ...conversation,
          otherUser: otherUserProfile || { id: otherUserId, username: 'Utilisateur inconnu' },
          messages: messages || []
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
          messages: []
        };
      }
    }));
    
    logger.info(`Successfully processed ${conversationsWithDetails.length} conversations with details`, {
      component: "findConversationsByProfileId"
    });
    
    return conversationsWithDetails;
  } catch (error) {
    logger.error('Error in findConversationsByProfileId:', {
      error,
      profileId,
      component: "findConversationsByProfileId"
    });
    throw error;
  }
};
