import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const createNewProfile = async (userId: string, email?: string) => {
  const defaultAvatarUrl = "/placeholder-couple.jpg";
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert([{
      user_id: userId,
      full_name: email?.split('@')[0] || 'New User',
      is_love_hotel_member: false,
      is_loolyb_holder: false,
      relationship_type: [],
      seeking: [],
      photo_urls: [],
      visibility: 'public',
      allowed_viewers: [],
      role: 'user',
      avatar_url: defaultAvatarUrl
    }])
    .select()
    .single();

  if (error) throw error;
  return newProfile;
};

export const fetchExistingProfile = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return { profile, error };
};

export const handleSessionError = async (error: any) => {
  if (error.message?.includes('refresh_token_not_found')) {
    await supabase.auth.signOut();
    return true;
  }
  return false;
};