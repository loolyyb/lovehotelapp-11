import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLogger } from "@/hooks/useLogger";
import { AlertService } from "@/services/AlertService";
import { Event } from "@/types/events";

export function useEvents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const logger = useLogger('EventsTab');

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
            status,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .order('event_date', { ascending: true });

      if (error) {
        logger.error('Error fetching events:', { error });
        throw error;
      }

      return data as unknown as Event[];
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          title: values.title,
          description: values.description,
          event_date: values.event_date,
          event_type: values.event_type,
          free_for_members: values.free_for_members,
          is_private: values.is_private,
          price: values.price,
          created_by: (await supabase.auth.getUser()).data.user?.id
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
      logger.info('Event created successfully');
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer l'événement",
      });
      logger.error('Error creating event:', { error });
      AlertService.captureException(error);
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from('events')
        .update({
          title: values.title,
          description: values.description,
          event_date: values.event_date,
          event_type: values.event_type,
          free_for_members: values.free_for_members,
          is_private: values.is_private,
          price: values.price
        })
        .eq('id', values.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast({
        title: "Événement modifié",
        description: "L'événement a été modifié avec succès",
      });
      logger.info('Event updated successfully');
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier l'événement",
      });
      logger.error('Error updating event:', { error });
      AlertService.captureException(error);
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
      logger.info('Event deleted successfully');
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
      });
      logger.error('Error deleting event:', { error });
      AlertService.captureException(error);
    }
  });

  return {
    events,
    isLoading,
    createEventMutation,
    updateEventMutation,
    deleteEventMutation
  };
}