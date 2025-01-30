import React from "react";
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
import { EventTableProps } from "./types";
import { EventActions } from "./EventActions";

export function EventTable({
  events,
  onEdit,
  onDelete,
  onShowParticipants,
  isUpdateLoading,
}: EventTableProps) {
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
            <TableCell>
              <EventActions
                event={event}
                onEdit={onEdit}
                onDelete={onDelete}
                onShowParticipants={onShowParticipants}
                isUpdateLoading={isUpdateLoading}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}