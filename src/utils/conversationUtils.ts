
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
      throw insertError;
    }

    if (!newConversation) {
      throw new Error("Failed to create conversation");
    }

    return { id: newConversation.id, isNew: true };
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
    
    // Use parameterized query approach instead of string interpolation
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id, 
        status,
        blocked_by,
        user1_id,
        user2_id,
        created_at,
        updated_at,
        user1:profiles!user1_id(id, username, full_name, avatar_url),
        user2:profiles!user2_id(id, username, full_name, avatar_url),
        messages(
          id,
          content,
          created_at,
          sender_id,
          read_at
        )
      `)
      .or(`user1_id.eq.${profileId},user2_id.eq.${profileId}`)
      .eq('status', 'active')
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching conversations by profile ID:", error);
      
      // Try a fallback approach with simpler query
      console.log("Trying fallback query approach...");
      
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${profileId},user2_id.eq.${profileId}`)
        .eq('status', 'active');
        
      if (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return [];
      }
      
      console.log(`Fallback found ${fallbackData?.length || 0} basic conversations`);
      
      // Attempt to resolve the profiles for each conversation
      const enrichedConversations = await Promise.all((fallbackData || []).map(async (conv) => {
        try {
          // Get the other user's profile (user1 or user2)
          const otherUserId = conv.user1_id === profileId ? conv.user2_id : conv.user1_id;
          
          const { data: otherUserProfile } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', otherUserId)
            .single();
            
          // Get the messages for this conversation
          const { data: messages } = await supabase
            .from('messages')
            .select('id, content, created_at, sender_id, read_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(10);
            
          return {
            ...conv,
            user1: conv.user1_id === profileId ? null : otherUserProfile,
            user2: conv.user1_id === profileId ? otherUserProfile : null,
            otherUser: otherUserProfile,
            messages: messages || []
          };
        } catch (err) {
          console.error(`Error enriching conversation ${conv.id}:`, err);
          return conv;
        }
      }));
      
      return enrichedConversations;
    }
    
    const processedData = data?.map(conversation => {
      // Add a messages array sorted by creation date, with the most recent first
      if (conversation.messages) {
        conversation.messages.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      return conversation;
    }) || [];
    
    console.log(`Found ${processedData.length} conversations for profile ${profileId}`);
    return processedData;
  } catch (error) {
    console.error("Exception in findConversationsByProfileId:", error);
    return [];
  }
};
