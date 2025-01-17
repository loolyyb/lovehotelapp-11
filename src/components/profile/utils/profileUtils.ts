import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const createNewProfile = async (userId: string, email: string): Promise<{ data: Tables<"profiles"> | null; error: any }> => {
  const defaultAvatarUrl = "/couple-default.jpg";
  
  const { data: newProfile, error: insertError } = await supabase
    .from('profiles')
    .upsert([{ 
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

  return { data: newProfile, error: insertError };
};

export const fetchExistingProfile = async (userId: string): Promise<{ data: Tables<"profiles"> | null; error: any }> => {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
};

export const updateExistingProfile = async (userId: string, updates: Partial<Tables<"profiles">>): Promise<{ error: any }> => {
  return await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId);
};