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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Event } from "@/types/events";

interface EventListProps {
  events: Event[];
  isLoading: boolean;
  onDelete: (eventId: string) => void;
}

export function EventList({ events, isLoading, onDelete }: EventListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Lieu</TableHead>
          <TableHead>Participants</TableHead>
          <TableHead>Prix</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              Chargement...
            </TableCell>
          </TableRow>
        ) : events && events.length > 0 ? (
          events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.title}</TableCell>
              <TableCell>
                <Badge>{event.type}</Badge>
              </TableCell>
              <TableCell>
                {format(new Date(event.date), "Pp", { locale: fr })}
              </TableCell>
              <TableCell>{event.location || "Non défini"}</TableCell>
              <TableCell>
                {event.max_participants
                  ? `Max ${event.max_participants}`
                  : "Illimité"}
              </TableCell>
              <TableCell>
                {event.price ? `${event.price}€` : "Gratuit"}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(event.id)}
                >
                  Supprimer
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              Aucun évènement trouvé
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}