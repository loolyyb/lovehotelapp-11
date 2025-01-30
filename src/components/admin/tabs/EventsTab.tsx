import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { Session } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Trash2, Edit, Users } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { EventForm } from "@/components/events/components/EventForm";
import { useLogger } from "@/hooks/useLogger";
import { AlertService } from "@/services/AlertService";
import { EventFormValues } from "@/components/events/types";

interface EventParticipant {
  id: string;
  user_id: string;
  status: string;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  } | null;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: "bdsm" | "jacuzzi" | "gastronomy" | "speed_dating" | "other";
  free_for_members?: boolean;
  is_private?: boolean;
  price?: number;
  event_participants?: EventParticipant[];
  created_at?: string;
  created_by?: string;
}

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
            profiles (
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
      
      // Cast the data to our Event type after validating the structure
      return (data || []) as Event[];
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
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              Créer un événement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <EventForm 
              onSubmit={handleCreateEvent}
              isLoading={createEventMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events?.map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                {format(new Date(event.event_date), "d MMMM yyyy", { locale: fr })}
              </TableCell>
              <TableCell>{event.title}</TableCell>
              <TableCell>{event.event_type}</TableCell>
              <TableCell>
                {event.event_participants?.length || 0}
                {event.free_for_members && (
                  <span className="ml-2 text-xs text-green-500">Gratuit membres</span>
                )}
              </TableCell>
              <TableCell>
                {event.price ? `${event.price}€` : 'Gratuit'}
              </TableCell>
              <TableCell className="space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  title="Voir les participants"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsParticipantsModalOpen(true);
                  }}
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      title="Modifier"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <EventForm 
                      initialData={event}
                      onSubmit={handleUpdateEvent}
                      isLoading={updateEventMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  size="icon"
                  title="Supprimer"
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
                      deleteMutation.mutate(event.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal des participants */}
      <Dialog open={isParticipantsModalOpen} onOpenChange={setIsParticipantsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <h3 className="text-lg font-semibold mb-4">
            Participants à {selectedEvent?.title}
          </h3>
          <div className="space-y-4">
            {selectedEvent?.event_participants?.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {participant.profiles?.avatar_url && (
                    <img 
                      src={participant.profiles.avatar_url} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span>{participant.profiles?.full_name || 'Utilisateur inconnu'}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Voulez-vous retirer ce participant ?')) {
                      // TODO: Implement remove participant
                    }
                  }}
                >
                  Retirer
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
