import { useState } from "react";
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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { EventForm } from "@/components/events/components/EventForm";
import { EventFormValues } from "@/components/events/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function EventsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

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
      setIsCreateModalOpen(false);
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
      setIsEditModalOpen(false);
      setSelectedEvent(null);
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
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
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

  const handleEditClick = (event: any) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (event: any) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
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
          <EventForm 
            onSubmit={async (values) => {
              await createEventMutation.mutateAsync(values);
            }}
            isLoading={createEventMutation.isPending}
          />
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Participants</TableHead>
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
              </TableCell>
              <TableCell className="space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  title="Voir les participants"
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  title="Modifier"
                  onClick={() => handleEditClick(event)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  title="Supprimer"
                  onClick={() => handleDeleteClick(event)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        {selectedEvent && (
          <EventForm
            initialData={selectedEvent}
            onSubmit={async (values) => {
              await updateEventMutation.mutateAsync({
                ...values,
                id: selectedEvent.id,
              });
            }}
            isLoading={updateEventMutation.isPending}
          />
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement l'événement
              et toutes les inscriptions associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedEvent) {
                  deleteMutation.mutate(selectedEvent.id);
                }
              }}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}