import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EventForm } from "./EventForm";
import { EventFormDialog } from "./components/EventFormDialog";
import { useEventManagement } from "./hooks/useEventManagement";
import { Shield, Globe, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export function EventsManager() {
  const { toast } = useToast();
  const { handleSubmit, isLoading, isOpen, setIsOpen } = useEventManagement();
  const [editingEvent, setEditingEvent] = React.useState<any>(null);

  const { data: events, refetch } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const handleDelete = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès",
      });

      refetch();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'événement",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (event: any) => {
    const eventDate = new Date(event.event_date);
    
    const formattedEvent = {
      ...event,
      event_date: eventDate.toISOString().split('T')[0],
      start_time: eventDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      end_time: event.end_time || "",
      free_for_members: event.free_for_members ?? true,
      price: event.price || null,
      is_private: event.is_private || false,
    };
    
    setEditingEvent(formattedEvent);
    setIsOpen(true);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gestion des événements</h2>
        <Button onClick={() => {
          setEditingEvent(null);
          setIsOpen(true);
        }}>
          Nouvel événement
        </Button>
      </div>

      <EventFormDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        event={editingEvent}
      >
        <EventForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          initialData={editingEvent}
        />
      </EventFormDialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events?.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="flex items-center gap-2">
                {event.is_private ? (
                  <Shield className="h-4 w-4 text-gray-500" />
                ) : (
                  <Globe className="h-4 w-4 text-gray-500" />
                )}
                {event.title}
              </TableCell>
              <TableCell>
                {new Date(event.event_date).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell>{event.event_type}</TableCell>
              <TableCell>
                {event.is_private ? "Privé" : "Public"}
              </TableCell>
              <TableCell>
                {event.free_for_members 
                  ? "Gratuit pour les membres" 
                  : `${event.price || 0}€`}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(event)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action ne peut pas être annulée. Cela supprimera définitivement l'événement.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(event.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}