import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventFormValues } from "@/components/events/types";

export function useEvents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_participants (
            id,
            user_id,
            status
          )
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          title: values.title,
          description: values.description,
          event_date: values.event_date,
          event_type: values.event_type,
          is_private: values.is_private,
          price: values.price,
          free_for_members: values.free_for_members,
          max_participants: values.max_participants,
          image_url: values.image_url,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
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

  const updateEventMutation = useMutation({
    mutationFn: async (values: EventFormValues & { id: string }) => {
      const { id, ...eventData } = values;
      const { error } = await supabase
        .from('events')
        .update({
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.event_date,
          event_type: eventData.event_type,
          is_private: eventData.is_private,
          price: eventData.price,
          free_for_members: eventData.free_for_members,
          max_participants: eventData.max_participants,
          image_url: eventData.image_url,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast({
        title: "Événement modifié",
        description: "L'événement a été modifié avec succès",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier l'événement",
      });
      console.error('Error updating event:', error);
    }
  });

  const deleteEventMutation = useMutation({
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
    events,
    isLoading,
    createEventMutation,
    updateEventMutation,
    deleteEventMutation,
  };
}