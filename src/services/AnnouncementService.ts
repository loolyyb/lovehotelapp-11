
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
          id,
          content,
          created_at,
          user:profiles!announcement_comments_user_id_fkey (
            full_name,
            avatar_url
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      throw error;
    }
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

    if (error) {
      console.error("Error creating announcement:", error);
      throw error;
    }
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

    if (error) {
      console.error("Error updating announcement:", error);
      throw error;
    }
  }

  static async deleteAnnouncement(id: string, userId: string) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error("Error deleting announcement:", error);
      throw error;
    }
  }

  static async handleReaction(announcementId: string, userId: string, reactionType: string) {
    try {
      const { data: existingReaction } = await supabase
        .from('announcement_reactions')
        .select()
        .eq('announcement_id', announcementId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Si même réaction, on la supprime
          const { error } = await supabase
            .from('announcement_reactions')
            .delete()
            .eq('id', existingReaction.id);
            
          if (error) throw error;
        } else {
          // Si réaction différente, on la met à jour
          const { error } = await supabase
            .from('announcement_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);
            
          if (error) throw error;
        }
      } else {
        // Si pas de réaction existante, on en crée une nouvelle
        const { error } = await supabase
          .from('announcement_reactions')
          .insert({
            announcement_id: announcementId,
            user_id: userId,
            reaction_type: reactionType
          });
          
        if (error) throw error;
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

    if (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }

  static async deleteComment(commentId: string, userId: string) {
    const { error } = await supabase
      .from('announcement_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }
}
