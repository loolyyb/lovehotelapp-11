import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Event } from '@/types/events';

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

export function EventModal({ event, onClose }: EventModalProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(true);

  const handleParticipate = async () => {
    try {
      // Implement participation logic here
      toast({
        title: "Succès",
        description: "Votre participation a été enregistrée",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Fermer
            </Button>
            <Button onClick={handleParticipate}>
              Participer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}