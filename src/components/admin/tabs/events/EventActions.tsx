import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Users } from "lucide-react";
import { EventActionsProps } from "./types";

export function EventActions({
  event,
  onEdit,
  onDelete,
  onShowParticipants,
  isUpdateLoading,
}: EventActionsProps) {
  return (
    <div className="space-x-2">
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
    </div>
  );
}