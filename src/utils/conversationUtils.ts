
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return user.id;
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
      throw profileError;
    }

    if (!profile) {
      console.error('No profile found with ID:', profileId);
      useToast().toast({
        variant: "destructive",
        title: "Erreur",
        description: "Profil introuvable.",
      });
      return null;
    }

    return profile.id;
  } catch (error) {
    console.error('Error in getTargetUserId:', error);
    useToast().toast({
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

    // Check if conversation exists
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
