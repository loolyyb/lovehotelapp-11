
import React, { useState } from "react";
import { Shield, Globe } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Event } from "./types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ParticipantsModal } from "./components/ParticipantsModal";
import { EventActions } from "./components/table/EventActions";
import { ParticipantsThumbnails } from "./components/table/ParticipantsThumbnails";
import { useEventParticipants } from "./hooks/useEventParticipants";

interface EventsTableProps {
  events?: Event[];
  onEdit?: (event: Event) => void;
}

export function EventsTable({ events, onEdit }: EventsTableProps) {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<{id: string, title: string} | null>(null);
  const { getParticipantsForEvent, refetchParticipants } = useEventParticipants();

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
                  <ParticipantsThumbnails participants={eventParticipants} />
                </TableCell>
                <TableCell>
                  <EventActions
                    event={event}
                    onEdit={onEdit || (() => {})}
                    onDelete={handleDelete}
                    onViewParticipants={setSelectedEvent}
                  />
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
