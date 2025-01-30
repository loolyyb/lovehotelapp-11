import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import { useLogger } from "@/hooks/useLogger";
import { AlertService } from "@/services/AlertService";
import { EventFormValues } from "@/components/events/types";
import { Event } from "@/types/events";
import { EventList } from "./events/EventList";
import { ParticipantsList } from "./events/ParticipantsList";
import { CreateEventDialog } from "./events/CreateEventDialog";

export function EventsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const logger = useLogger('EventsTab');
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = React.useState(false);

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

      const typedData = (data || []) as unknown as Event[];
      return typedData;
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      const eventData = {
        title: values.title,
        description: values.description,
        event_date: values.event_date,
        event_type: values.event_type,
        free_for_members: values.free_for_members,
        is_private: values.is_private,
        price: values.price,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
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
      setIsCreateModalOpen(false);
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
    mutationFn: async (values: EventFormValues & { id: string }) => {
      const eventData = {
        id: values.id,
        title: values.title,
        description: values.description,
        event_date: values.event_date,
        event_type: values.event_type,
        free_for_members: values.free_for_members,
        is_private: values.is_private,
        price: values.price
      };

      const { data, error } = await supabase
        .from('events')
        .update(eventData)
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
      setSelectedEvent(null);
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

  const handleCreateEvent = async (values: EventFormValues) => {
    await createEventMutation.mutateAsync(values);
  };

  const handleUpdateEvent = async (values: EventFormValues & { id: string }) => {
    await updateEventMutation.mutateAsync(values);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des événements</h2>
        <CreateEventDialog
          isOpen={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateEvent}
          isLoading={createEventMutation.isPending}
        />
      </div>

      <div className="admin-search flex items-center gap-3 mb-8">
        <Search className="text-admin-muted" size={20} />
        <input 
          type="text" 
          placeholder="Rechercher..." 
          className="admin-input w-full"
        />
      </div>

      <EventList
        events={events}
        onEdit={setSelectedEvent}
        onDelete={(eventId) => deleteMutation.mutate(eventId)}
        onShowParticipants={(event) => {
          setSelectedEvent(event);
          setIsParticipantsModalOpen(true);
        }}
        isUpdateLoading={updateEventMutation.isPending}
      />

      <ParticipantsList
        isOpen={isParticipantsModalOpen}
        onOpenChange={setIsParticipantsModalOpen}
        selectedEvent={selectedEvent}
      />
    </div>
  );
}