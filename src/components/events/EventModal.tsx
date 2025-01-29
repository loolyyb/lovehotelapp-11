import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Event } from './types';
import { EventParticipationButton } from './components/EventParticipationButton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventModalProps {
  event: Event;
  onClose: () => void;
  onParticipationSuccess?: () => void;
}

export function EventModal({ event, onClose, onParticipationSuccess }: EventModalProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const formattedDate = format(new Date(event.start), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });

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
              {formattedDate}
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
                : event.extendedProps.price 
                  ? `Prix: ${event.extendedProps.price}€`
                  : "Gratuit"}
            </p>
          </div>

          <EventParticipationButton 
            eventId={event.id} 
            onSuccess={onParticipationSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}