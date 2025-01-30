import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventFormValues } from "@/components/events/types";

export function useEventMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      let image_url = null;
      if (values.image) {
        const fileExt = values.image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('event_images')
          .upload(fileName, values.image);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('event_images')
          .getPublicUrl(fileName);
          
        image_url = publicUrl;
      }

      const { error } = await supabase
        .from('events')
        .insert([{
          title: values.title,
          description: values.description,
          event_type: values.event_type,
          event_date: `${values.event_date}T${values.start_time}`,
          is_private: values.is_private,
          price: values.price,
          free_for_members: values.free_for_members,
          image_url,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast({
        title: "Événement créé",
        description: "L'événement a été créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer l'événement",
      });
      console.error('Error creating event:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
      });
      console.error('Error deleting event:', error);
    }
  });

  return {
    createMutation,
    deleteMutation
  };
}