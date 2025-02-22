
import { supabase } from "@/integrations/supabase/client";
import { AnnouncementWithRelations } from "@/types/announcements.types";

export class AnnouncementService {
  static async fetchAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        user:profiles!announcements_user_id_fkey (
          full_name,
          avatar_url
        ),
        reactions:announcement_reactions (
          type:reaction_type,
          user_id
        ),
        comments:announcement_comments (
          id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AnnouncementWithRelations[];
  }

  static async createAnnouncement(content: string, imageUrl: string | undefined, userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { error } = await supabase
      .from('announcements')
      .insert({
        content,
        image_url: imageUrl,
        user_id: profile.id // Utiliser l'ID du profil plutôt que l'ID d'authentification
      });

    if (error) throw error;
  }

  static async updateAnnouncement(id: string, content: string, imageUrl: string | undefined, userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { error } = await supabase
      .from('announcements')
      .update({
        content,
        image_url: imageUrl,
      })
      .eq('id', id)
      .eq('user_id', profile.id); // Utiliser l'ID du profil plutôt que l'ID d'authentification

    if (error) throw error;
  }

  static async deleteAnnouncement(id: string, userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)
      .eq('user_id', profile.id); // Utiliser l'ID du profil plutôt que l'ID d'authentification

    if (error) throw error;
  }

  static async handleReaction(announcementId: string, userId: string, reactionType: string) {
    const { data: existingReaction } = await supabase
      .from('announcement_reactions')
      .select()
      .eq('announcement_id', announcementId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingReaction) {
      if (existingReaction.reaction_type === reactionType) {
        await supabase
          .from('announcement_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        await supabase
          .from('announcement_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existingReaction.id);
      }
    } else {
      await supabase
        .from('announcement_reactions')
        .insert({
          announcement_id: announcementId,
          user_id: userId,
          reaction_type: reactionType
        });
    }
  }
}
