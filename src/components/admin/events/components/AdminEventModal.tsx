import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Event } from '../types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminEventModalProps {
  event: Event;
  onClose: () => void;
  onEditSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function AdminEventModal({ 
  event, 
  onClose,
  onEditSuccess,
  onDeleteSuccess 
}: AdminEventModalProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const { toast } = useToast();

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès",
      });

      handleClose();
      onDeleteSuccess?.();
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{event.title}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  handleClose();
                  onEditSuccess?.();
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action ne peut pas être annulée. Cela supprimera définitivement l'événement.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {event.extendedProps.imageUrl && (
          <div className="relative w-full h-48 mb-4">
            <img
              src={event.extendedProps.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">
              {new Date(event.start).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="flex gap-2">
            <Badge variant={event.extendedProps.isPrivate ? "secondary" : "default"}>
              {event.extendedProps.isPrivate ? "Privé" : "Public"}
            </Badge>
            <Badge variant="outline">
              {event.extendedProps.type}
            </Badge>
          </div>

          <p className="text-sm">{event.extendedProps.description}</p>

          <div className="text-sm">
            <p>
              {event.extendedProps.freeForMembers 
                ? "Gratuit pour les membres" 
                : `Prix: ${event.extendedProps.price}€`}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}