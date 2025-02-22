
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useAnnouncementDeletion() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (announcementId: string, userId: string) => {
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Annonce supprimée",
        description: "Votre annonce a été supprimée avec succès"
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'annonce"
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDelete
  };
}
