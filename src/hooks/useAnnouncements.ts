
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { AnnouncementService } from "@/services/AnnouncementService";
import { AnnouncementWithRelations } from "@/types/announcements.types";

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<AnnouncementWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { session } = useAuthSession();

  const fetchAnnouncements = async () => {
    try {
      const data = await AnnouncementService.fetchAnnouncements();
      setAnnouncements(data);
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
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour publier une annonce"
      });
      return;
    }

    try {
      await AnnouncementService.createAnnouncement(content, imageUrl, session.user.id);
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
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour modifier une annonce"
      });
      return;
    }

    try {
      await AnnouncementService.updateAnnouncement(id, content, imageUrl, session.user.id);
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
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour supprimer une annonce"
      });
      return;
    }

    try {
      await AnnouncementService.deleteAnnouncement(id, session.user.id);
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
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour réagir à une annonce"
      });
      return;
    }

    try {
      await AnnouncementService.handleReaction(announcementId, session.user.id, reactionType);
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
