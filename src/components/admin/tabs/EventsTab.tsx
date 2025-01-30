import React from "react";
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
import { Dialog } from "@/components/ui/dialog";
import { EventForm } from "@/components/events/components/EventForm";
import { EventFormValues } from "@/components/events/types";

export function EventsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

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

  const createMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      // First, upload the image if provided
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

      // Then create the event
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
      setIsCreateDialogOpen(false);
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
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Créer un événement
        </Button>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <EventForm 
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
          }}
          isLoading={createMutation.isPending}
        />
      </Dialog>

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
                >
                  <Edit className="h-4 w-4" />
                </Button>
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
    </div>
  );
}