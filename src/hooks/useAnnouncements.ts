
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Database } from "@/integrations/supabase/types/database.types";

export type AnnouncementWithRelations = Database['public']['Tables']['announcements']['Row'] & {
  user: {
    full_name: string;
    avatar_url?: string;
  };
  reactions: Array<{
    type: string;
    user_id: string;
  }>;
  comments: Array<{
    id: string;
  }>;
};

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<AnnouncementWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { session, userProfile } = useAuthSession();

  const fetchAnnouncements = async () => {
    try {
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

      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les annonces"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnnouncement = async (content: string, imageUrl?: string) => {
    if (!userProfile?.id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour publier une annonce"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          content,
          image_url: imageUrl,
          user_id: userProfile.id
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre annonce a été publiée"
      });
      
      await fetchAnnouncements();
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de publier l'annonce"
      });
    }
  };

  const handleUpdateAnnouncement = async (id: string, content: string, imageUrl?: string) => {
    if (!userProfile?.id) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          content,
          image_url: imageUrl,
        })
        .eq('id', id)
        .eq('user_id', userProfile.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre annonce a été modifiée"
      });
      
      await fetchAnnouncements();
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier l'annonce"
      });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!userProfile?.id) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)
        .eq('user_id', userProfile.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre annonce a été supprimée"
      });
      
      await fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'annonce"
      });
    }
  };

  const handleReaction = async (announcementId: string, reactionType: string) => {
    if (!userProfile?.id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour réagir à une annonce"
      });
      return;
    }

    try {
      const { data: existingReaction } = await supabase
        .from('announcement_reactions')
        .select()
        .eq('announcement_id', announcementId)
        .eq('user_id', userProfile.id)
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
            user_id: userProfile.id,
            reaction_type: reactionType
          });
      }

      await fetchAnnouncements();
    } catch (error) {
      console.error("Error handling reaction:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de réagir à l'annonce"
      });
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    const channel = supabase
      .channel("announcements-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "announcements"
        },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    announcements,
    loading,
    handleSubmitAnnouncement,
    handleUpdateAnnouncement,
    handleDeleteAnnouncement,
    handleReaction,
    session
  };
}
