import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Edit, Trash2, Users } from "lucide-react";
import { Event } from "@/types/events";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { EventForm } from "@/components/events/components/EventForm";

interface EventListProps {
  events: Event[] | undefined;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onShowParticipants: (event: Event) => void;
  isUpdateLoading: boolean;
}

export function EventList({
  events,
  onEdit,
  onDelete,
  onShowParticipants,
  isUpdateLoading,
}: EventListProps) {
  return (
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
                onClick={() => onShowParticipants(event)}
              >
                <Users className="h-4 w-4" />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    title="Modifier"
                    onClick={() => onEdit(event)}
                    disabled={isUpdateLoading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button 
                variant="outline" 
                size="icon"
                title="Supprimer"
                onClick={() => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
                    onDelete(event.id);
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
  );
}