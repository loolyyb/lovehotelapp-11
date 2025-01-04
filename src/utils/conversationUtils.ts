import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return user.id;
};

export const getTargetUserId = async (profileId: string) => {
  try {
    // D'abord, on récupère le profil avec l'ID fourni
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, username, full_name')
      .eq('id', profileId)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
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

    return profile.user_id;
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
    // Vérifier si une conversation existe déjà
    const { data: existingConversations, error: queryError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${currentUserId})`)
      .eq('status', 'active');

    if (queryError) throw queryError;

    if (existingConversations && existingConversations.length > 0) {
      return { id: existingConversations[0].id, isNew: false };
    }

    // Créer une nouvelle conversation
    const { data: newConversation, error: insertError } = await supabase
      .from('conversations')
      .insert({
        user1_id: currentUserId,
        user2_id: targetUserId,
        status: 'active'
      })
      .select('id')
      .single();

    if (insertError) throw insertError;
    if (!newConversation) throw new Error("Échec de la création de la conversation");

    return { id: newConversation.id, isNew: true };
  } catch (error) {
    console.error('Error in createOrGetConversation:', error);
    throw error;
  }
};