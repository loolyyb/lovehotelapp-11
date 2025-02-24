
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnnouncementsTableProps } from "../types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function AnnouncementsTable({ announcements, onEdit, onDelete }: AnnouncementsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contenu</TableHead>
          <TableHead>Auteur</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Date de création</TableHead>
          <TableHead>Dernière modification</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {announcements.map((announcement) => (
          <TableRow key={announcement.id}>
            <TableCell className="max-w-md">
              <div className="truncate">{announcement.content}</div>
            </TableCell>
            <TableCell>{announcement.user?.full_name || "Utilisateur inconnu"}</TableCell>
            <TableCell>
              {announcement.image_url && (
                <img 
                  src={announcement.image_url} 
                  alt="Image de la publication" 
                  className="w-16 h-16 object-cover rounded"
                />
              )}
            </TableCell>
            <TableCell>
              {format(new Date(announcement.created_at), 'Pp', { locale: fr })}
            </TableCell>
            <TableCell>
              {announcement.updated_at && 
                format(new Date(announcement.updated_at), 'Pp', { locale: fr })}
            </TableCell>
            <TableCell>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(announcement)}
                >
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(announcement)}
                >
                  Supprimer
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
