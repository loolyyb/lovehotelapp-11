import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Edit, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EventsTableProps {
  events: any[];
  onEdit: (event: any) => void;
  onDelete: (event: any) => void;
}

export function EventsTable({ events, onEdit, onDelete }: EventsTableProps) {
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
                onClick={() => onDelete(event)}
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