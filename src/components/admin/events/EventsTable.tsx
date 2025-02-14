
import React, { useState } from "react";
import { Shield, Globe, Users, Eye, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Event } from "./types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ParticipantsModal } from "./components/ParticipantsModal";
import { useToast } from "@/hooks/use-toast";

interface EventsTableProps {
  events?: Event[];
  onEdit?: (event: Event) => void;
}

export function EventsTable({ events, onEdit }: EventsTableProps) {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<{id: string, title: string} | null>(null);

  const { data: participants, refetch: refetchParticipants } = useQuery({
    queryKey: ['event-participants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_participants_with_profiles')
        .select('*')
        .order('registered_at', { ascending: false });

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

      // Rafraîchir la liste des événements
      refetchParticipants();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'événement",
        variant: "destructive",
      });
    }
  };

  const getParticipantsForEvent = (eventId: string) => {
    return participants?.filter(p => p.event_id === eventId) || [];
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events?.map((event) => {
            const eventParticipants = getParticipantsForEvent(event.id);
            
            return (
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {eventParticipants.slice(0, 3).map((participant) => (
                              <Avatar key={participant.participation_id} className="w-8 h-8 border-2 border-white">
                                <AvatarImage src={participant.avatar_url} />
                                <AvatarFallback>{participant.full_name?.[0]}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {eventParticipants.length} 
                            <Users className="inline ml-1 h-4 w-4" />
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-2">
                          {eventParticipants.map((participant) => (
                            <div key={participant.participation_id} className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={participant.avatar_url} />
                                <AvatarFallback>{participant.full_name?.[0]}</AvatarFallback>
                              </Avatar>
                              <span>{participant.full_name}</span>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit?.(event)}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEvent({ id: event.id, title: event.title })}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir participants
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedEvent && (
        <ParticipantsModal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          participants={getParticipantsForEvent(selectedEvent.id)}
          eventTitle={selectedEvent.title}
        />
      )}
    </>
  );
}
