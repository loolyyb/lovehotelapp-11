import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Event {
  id: string;
  event_date: string;
  title: string;
  event_type: string;
  event_participants?: { id: string }[];
}

interface EventsTableProps {
  events: Event[];
  onDelete: (eventId: string) => void;
  onEdit: (event: Event) => void;
  onViewParticipants: (event: Event) => void;
}

export function EventsTable({ events, onDelete, onEdit, onViewParticipants }: EventsTableProps) {
  return (
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
                onClick={() => onViewParticipants(event)}
              >
                <Users className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                title="Modifier"
                onClick={() => onEdit(event)}
              >
                <Edit className="h-4 w-4" />
              </Button>
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