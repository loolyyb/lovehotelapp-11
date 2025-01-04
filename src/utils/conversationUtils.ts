import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', user.id)
    .maybeSingle();
  
  return profile?.user_id || user.id;
};

export const getTargetUserId = async (profileId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', profileId)
      .maybeSingle();
    
    if (error) throw error;
    if (!profile?.user_id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de trouver l'utilisateur cible.",
      });
      return null;
    }
    
    return profile.user_id;
  } catch (error) {
    console.error('Error fetching target user:', error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de trouver l'utilisateur cible.",
    });
    return null;
  }
};

export const createOrGetConversation = async (currentUserId: string, targetUserId: string) => {
  try {
    // Check if a conversation already exists
    const { data: existingConversations, error: queryError } = await supabase
      .from('conversations')
      .select('id, user1_id, user2_id')
      .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${currentUserId})`)
      .eq('status', 'active');

    if (queryError) throw queryError;

    const existingConversation = existingConversations?.[0];

    if (existingConversation) {
      return { id: existingConversation.id, isNew: false };
    }

    // Create new conversation
    const { data: newConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        user1_id: currentUserId,
        user2_id: targetUserId,
        status: 'active'
      })
      .select()
      .maybeSingle();

    if (conversationError) throw conversationError;
    if (!newConversation) throw new Error("Failed to create conversation");

    return { id: newConversation.id, isNew: true };
  } catch (error) {
    console.error('Error managing conversation:', error);
    throw error;
  }
};