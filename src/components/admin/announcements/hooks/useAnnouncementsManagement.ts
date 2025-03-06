
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, safeQueryResult } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminAnnouncement } from "../types";

export function useAnnouncementsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          profiles!inner(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return safeQueryResult<AdminAnnouncement>(data);
    }
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, content, imageUrl }: { id: string; content: string; imageUrl?: string | null }) => {
      const updateData = { 
        content, 
        image_url: imageUrl, 
        updated_at: new Date().toISOString() 
      } as any;

      const { error } = await supabase
        .from('announcements')
        .update(updateData)
        .eq('id', id as any);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Publication mise à jour",
        description: "Les modifications ont été enregistrées avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour la publication: " + error.message
      });
    }
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id as any);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Publication supprimée",
        description: "La publication a été supprimée avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer la publication: " + error.message
      });
    }
  });

  return {
    announcements,
    isLoading,
    updateAnnouncement: updateAnnouncementMutation.mutate,
    deleteAnnouncement: deleteAnnouncementMutation.mutate,
    isUpdating: updateAnnouncementMutation.isPending,
    isDeleting: deleteAnnouncementMutation.isPending,
  };
}
