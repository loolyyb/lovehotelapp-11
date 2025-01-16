import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Globe } from "lucide-react";
import { Event } from "./types";

interface EventsTableProps {
  events: Event[] | null;
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}