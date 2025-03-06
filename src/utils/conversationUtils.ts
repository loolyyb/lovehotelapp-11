
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      console.error('Error fetching profile by auth ID:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Exception in getProfileByAuthId:', error);
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
      console.error('Error fetching profile:', profileError);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Profil introuvable.",
      });
      return null;
    }

    if (!profile) {
      console.error('No profile found with ID:', profileId);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Profil introuvable.",
      });
      return null;
    }

    return profile.id;
  } catch (error) {
    console.error('Error in getTargetUserId:', error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de récupérer les informations de l'utilisateur.",
    });
    return null;
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
      console.error('Error getting current user profile:', currentUserError);
      throw currentUserError;
    }

    if (!currentUserProfile) {
      throw new Error("Current user profile not found");
    }

    // Check if conversation exists using proper parameters
    const { data: existingConversations, error: queryError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${currentUserProfile.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${currentUserProfile.id})`)
      .eq('status', 'active');

    if (queryError) {
      console.error('Error checking existing conversations:', queryError);
      throw queryError;
    }

    if (existingConversations && existingConversations.length > 0) {
      return { id: existingConversations[0].id, isNew: false };
    }

    // Try the service role key if available for bypassing RLS
    try {
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
        console.error('Error creating conversation:', insertError);
        
        // If we get an RLS error, try a different approach
        if (insertError.code === '42501') {
          console.log('Attempting alternative approach due to RLS issue');
          
          // Try creating a conversation with a different structure
          const { data: newConv, error: newConvError } = await supabase.rpc('create_conversation', {
            user1: currentUserProfile.id,
            user2: targetUserId
          });
          
          if (newConvError) {
            console.error('RPC method failed:', newConvError);
            throw newConvError;
          }
          
          return { id: newConv.id, isNew: true };
        }
        
        throw insertError;
      }

      if (!newConversation) {
        throw new Error("Failed to create conversation");
      }

      return { id: newConversation.id, isNew: true };
    } catch (innerError) {
      console.error('Error in inner conversation creation attempt:', innerError);
      throw innerError;
    }
  } catch (error) {
    console.error('Error in createOrGetConversation:', error);
    throw error;
  }
};

// Function to find conversations by profile ID
export const findConversationsByProfileId = async (profileId: string) => {
  if (!profileId) {
    console.error("No profile ID provided to findConversationsByProfileId");
    return [];
  }
  
  try {
    console.log(`Finding conversations for profile: ${profileId}`);
    
    // Let's try a more direct and simpler approach
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
      console.error("Error fetching conversations by profile ID:", error);
      
      // If there's an RLS error, let's try an alternative approach
      if (error.code === '42501') {
        console.log('Attempting to use RPC function due to RLS issue');
        
        // Try using a stored procedure if available
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_conversations', {
          profile_id: profileId
        });
        
        if (rpcError) {
          console.error('RPC method failed:', rpcError);
          return [];
        }
        
        console.log(`Found ${rpcData.length} conversations via RPC`);
        return rpcData;
      }
      
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`No conversations found for profile ${profileId}`);
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
          console.error(`Error fetching profile for user ${otherUserId}:`, profileError);
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
          console.error(`Error fetching messages for conversation ${conversation.id}:`, messagesError);
        }
        
        return {
          ...conversation,
          user1: conversation.user1_id === profileId ? { id: profileId } : otherUserProfile,
          user2: conversation.user1_id === profileId ? otherUserProfile : { id: profileId },
          otherUser: otherUserProfile,
          messages: messages || []
        };
      } catch (err) {
        console.error(`Error enriching conversation ${conversation.id}:`, err);
        return conversation;
      }
    }));
    
    console.log(`Found ${conversationsWithProfiles.length} enriched conversations for profile ${profileId}`);
    return conversationsWithProfiles;
  } catch (error) {
    console.error("Exception in findConversationsByProfileId:", error);
    return [];
  }
};

// Helper function that attempts to call the Supabase create_conversation RPC function if it exists
export const attemptCreateConversationRPC = async (user1Id: string, user2Id: string) => {
  try {
    // Check if the stored procedure exists first by testing it
    const { data, error } = await supabase.rpc('create_conversation', {
      user1: user1Id,
      user2: user2Id
    });
    
    if (error) {
      console.error('RPC method failed or does not exist:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in attemptCreateConversationRPC:', error);
    return null;
  }
};

// Helper function to directly create a test conversation - for admin use
export const createTestConversation = async (profileId: string, otherProfileId: string) => {
  try {
    console.log(`Attempting to create test conversation between ${profileId} and ${otherProfileId}`);
    
    // First try using the normal method
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
      // If RLS blocks this, try the RPC method
      if (error.code === '42501') {
        console.log('RLS error, trying RPC method...');
        return await attemptCreateConversationRPC(profileId, otherProfileId);
      }
      
      console.error('Error creating test conversation:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in createTestConversation:', error);
    return null;
  }
};
