
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";

export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return user.id;
};

export const getProfileByAuthId = async (authUserId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, username, avatar_url')
      .eq('user_id', authUserId)
      .single();
    
    if (error) {
      logger.error('Error fetching profile by auth ID:', {
        error,
        authUserId,
        component: "getProfileByAuthId"
      });
      return null;
    }

    return profile;
  } catch (error) {
    logger.error('Exception in getProfileByAuthId:', {
      error,
      authUserId,
      component: "getProfileByAuthId"
    });
    return null;
  }
};

export const getTargetUserId = async (profileId: string) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profileId)
      .single();
    
    if (profileError) {
      logger.error('Error fetching profile:', {
        error: profileError,
        profileId,
        component: "getTargetUserId"
      });
      return { error: "Profile not found" };
    }

    if (!profile) {
      logger.error('No profile found with ID:', {
        profileId,
        component: "getTargetUserId"
      });
      return { error: "Profile not found" };
    }

    return { data: profile.id };
  } catch (error) {
    logger.error('Error in getTargetUserId:', {
      error,
      profileId,
      component: "getTargetUserId"
    });
    return { error: "Unable to retrieve user information" };
  }
};

export const createOrGetConversation = async (currentUserId: string, targetUserId: string) => {
  try {
    // Get current user's profile ID
    const { data: currentUserProfile, error: currentUserError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', currentUserId)
      .single();

    if (currentUserError) {
      logger.error('Error getting current user profile:', {
        error: currentUserError,
        userId: currentUserId,
        component: "createOrGetConversation"
      });
      throw currentUserError;
    }

    if (!currentUserProfile) {
      logger.error('Current user profile not found', {
        userId: currentUserId,
        component: "createOrGetConversation"
      });
      throw new Error("Current user profile not found");
    }

    logger.info('Checking for existing conversation', {
      currentProfileId: currentUserProfile.id,
      targetProfileId: targetUserId,
      component: "createOrGetConversation"
    });

    // Check if conversation exists using proper parameters
    const { data: existingConversations, error: queryError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${currentUserProfile.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${currentUserProfile.id})`)
      .eq('status', 'active');

    if (queryError) {
      logger.error('Error checking existing conversations:', {
        error: queryError,
        userId: currentUserId,
        targetId: targetUserId,
        component: "createOrGetConversation"
      });
      throw queryError;
    }

    if (existingConversations && existingConversations.length > 0) {
      logger.info('Found existing conversation', {
        conversationId: existingConversations[0].id,
        component: "createOrGetConversation"
      });
      return { id: existingConversations[0].id, isNew: false };
    }

    logger.info('Creating new conversation', {
      user1: currentUserProfile.id,
      user2: targetUserId,
      component: "createOrGetConversation"
    });

    // Create new conversation using profile IDs
    const { data: newConversation, error: insertError } = await supabase
      .from('conversations')
      .insert({
        user1_id: currentUserProfile.id,
        user2_id: targetUserId,
        status: 'active'
      })
      .select('id')
      .single();

    if (insertError) {
      logger.error('Error creating conversation:', {
        error: insertError,
        user1: currentUserProfile.id,
        user2: targetUserId,
        component: "createOrGetConversation"
      });
      throw insertError;
    }

    if (!newConversation) {
      logger.error('Failed to create conversation, no data returned', {
        component: "createOrGetConversation"
      });
      throw new Error("Failed to create conversation");
    }

    logger.info('New conversation created', {
      conversationId: newConversation.id,
      component: "createOrGetConversation"
    });

    return { id: newConversation.id, isNew: true };
  } catch (error) {
    logger.error('Error in createOrGetConversation:', {
      error,
      component: "createOrGetConversation"
    });
    throw error;
  }
};

// Function to find conversations by profile ID
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
    
    if (authError || !user) {
      logger.error("Authentication error in findConversationsByProfileId", {
        error: authError,
        component: "findConversationsByProfileId"
      });
      return [];
    }
    
    // Get the user's profile to ensure correct association
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (profileError || !userProfile) {
      logger.error("Failed to retrieve user profile", {
        error: profileError,
        userId: user.id,
        component: "findConversationsByProfileId"
      });
      return [];
    }
    
    // Ensure the requested profile matches the authenticated user's profile
    if (userProfile.id !== profileId) {
      logger.error("Profile ID mismatch", {
        authProfileId: userProfile.id,
        requestedProfileId: profileId,
        component: "findConversationsByProfileId"
      });
      // If these don't match, there may be a session/profile issue
      // We'll use the correct profile ID from auth
      profileId = userProfile.id;
      logger.info(`Using corrected profile ID: ${profileId}`, {
        component: "findConversationsByProfileId"
      });
    }
    
    // Let's try a more direct and simpler approach with RLS in mind
    const { data, error } = await supabase
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
      
    if (error) {
      logger.error("Error fetching conversations by profile ID:", {
        error,
        profileId,
        component: "findConversationsByProfileId"
      });
      return [];
    }
    
    if (!data || data.length === 0) {
      logger.info(`No conversations found for profile ${profileId}`, {
        component: "findConversationsByProfileId"
      });
      return [];
    }
    
    // Fetch user profiles for each conversation
    const conversationsWithProfiles = await Promise.all(data.map(async (conversation) => {
      try {
        const otherUserId = conversation.user1_id === profileId 
          ? conversation.user2_id 
          : conversation.user1_id;
        
        // Get the other user's profile
        const { data: otherUserProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', otherUserId)
          .single();
          
        if (profileError) {
          logger.error(`Error fetching profile for user ${otherUserId}:`, {
            error: profileError,
            component: "findConversationsByProfileId"
          });
          return {
            ...conversation,
            user1: conversation.user1_id === profileId ? { id: profileId } : otherUserProfile,
            user2: conversation.user1_id === profileId ? otherUserProfile : { id: profileId },
            otherUser: otherUserProfile || { id: otherUserId, username: 'Utilisateur inconnu' }
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
        }
        
        return {
          ...conversation,
          user1: conversation.user1_id === profileId ? { id: profileId } : otherUserProfile,
          user2: conversation.user1_id === profileId ? otherUserProfile : { id: profileId },
          otherUser: otherUserProfile,
          messages: messages || []
        };
      } catch (err) {
        logger.error(`Error enriching conversation ${conversation.id}:`, {
          error: err,
          component: "findConversationsByProfileId"
        });
        return conversation;
      }
    }));
    
    logger.info(`Found ${conversationsWithProfiles.length} enriched conversations for profile ${profileId}`, {
      component: "findConversationsByProfileId"
    });
    return conversationsWithProfiles;
  } catch (error) {
    logger.error("Exception in findConversationsByProfileId:", {
      error,
      component: "findConversationsByProfileId"
    });
    return [];
  }
};

// Helper function to create a test conversation - for admin use
export const createTestConversation = async (profileId: string, otherProfileId: string) => {
  try {
    logger.info(`Attempting to create test conversation between ${profileId} and ${otherProfileId}`, {
      component: "createTestConversation"
    });
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      logger.error("Authentication error in createTestConversation", {
        error: authError,
        component: "createTestConversation"
      });
      return null;
    }
    
    // Get the user's profile to ensure correct association
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (profileError || !userProfile) {
      logger.error("Failed to retrieve user profile for test conversation", {
        error: profileError,
        userId: user.id,
        component: "createTestConversation"
      });
      return null;
    }
    
    // Create test conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user1_id: profileId,
        user2_id: otherProfileId,
        status: 'active'
      })
      .select()
      .single();
      
    if (error) {
      logger.error('Error creating test conversation:', {
        error,
        component: "createTestConversation"
      });
      return null;
    }
    
    logger.info('Test conversation created successfully', {
      conversationId: data.id,
      component: "createTestConversation"
    });
    
    return data;
  } catch (error) {
    logger.error('Exception in createTestConversation:', {
      error,
      component: "createTestConversation"
    });
    return null;
  }
};
