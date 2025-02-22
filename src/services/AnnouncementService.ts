
import { supabase } from "@/integrations/supabase/client";
import { AnnouncementWithRelations } from "@/types/announcements.types";

export class AnnouncementService {
  static async fetchAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        user:profiles!announcements_user_id_fkey(
          id,
          full_name,
          avatar_url,
          username
        ),
        reactions:announcement_reactions(
          reaction_type,
          user_id
        ),
        comments:announcement_comments(
          id,
          content,
          created_at,
          user_id,
          user:profiles!announcement_comments_user_id_fkey(
            id,
            full_name,
            avatar_url,
            username
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AnnouncementWithRelations[];
  }

  static async createAnnouncement(content: string, imageUrl: string | undefined, userId: string) {
    const { error } = await supabase
      .from('announcements')
      .insert({
        content,
        image_url: imageUrl,
        user_id: userId
      });

    if (error) throw error;
  }

  static async updateAnnouncement(id: string, content: string, imageUrl: string | undefined, userId: string) {
    const { error } = await supabase
      .from('announcements')
      .update({
        content,
        image_url: imageUrl,
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async deleteAnnouncement(id: string, userId: string) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async handleReaction(announcementId: string, userId: string, reactionType: string) {
    try {
      const { data: existingReaction, error: fetchError } = await supabase
        .from('announcement_reactions')
        .select()
        .eq('announcement_id', announcementId)
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          const { error: deleteError } = await supabase
            .from('announcement_reactions')
            .delete()
            .eq('announcement_id', announcementId)
            .eq('user_id', userId);

          if (deleteError) throw deleteError;
        } else {
          const { error: updateError } = await supabase
            .from('announcement_reactions')
            .update({ reaction_type: reactionType })
            .eq('announcement_id', announcementId)
            .eq('user_id', userId);

          if (updateError) throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from('announcement_reactions')
          .insert({
            announcement_id: announcementId,
            user_id: userId,
            reaction_type: reactionType
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
      throw error;
    }
  }

  static async addComment(announcementId: string, content: string, userId: string) {
    const { error } = await supabase
      .from('announcement_comments')
      .insert({
        announcement_id: announcementId,
        user_id: userId,
        content
      });

    if (error) throw error;
  }
}
