
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/LogService";

/**
 * Creates a new conversation or returns an existing one between two users
 * @param currentUserId The current user's auth ID
 * @param targetUserId The target user's profile ID
 * @returns Object with the conversation ID and whether it's new
 */
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

    // Check if conversation exists
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
