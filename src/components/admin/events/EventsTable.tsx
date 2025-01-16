import React from "react";
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

interface EventsTableProps {
  events?: Event[];
}

export function EventsTable({ events }: EventsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Prix</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events?.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="flex items-center gap-2">
              {event.extendedProps.isPrivate ? (
                <Shield className="h-4 w-4 text-gray-500" />
              ) : (
                <Globe className="h-4 w-4 text-gray-500" />
              )}
              {event.title}
            </TableCell>
            <TableCell>
              {event.start.toLocaleDateString('fr-FR')}
            </TableCell>
            <TableCell>{event.extendedProps.type}</TableCell>
            <TableCell>
              {event.extendedProps.isPrivate ? "Privé" : "Public"}
            </TableCell>
            <TableCell>
              {event.extendedProps.freeForMembers 
                ? "Gratuit pour les membres" 
                : `${event.extendedProps.price || 0}€`}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}