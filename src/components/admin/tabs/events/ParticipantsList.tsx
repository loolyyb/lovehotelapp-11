import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Event, EventParticipant } from "@/types/events";

interface ParticipantsListProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEvent: Event | null;
  onRemoveParticipant?: (participantId: string) => void;
}

export function ParticipantsList({
  isOpen,
  onOpenChange,
  selectedEvent,
  onRemoveParticipant,
}: ParticipantsListProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <h3 className="text-lg font-semibold mb-4">
          Participants à {selectedEvent?.title}
        </h3>
        <div className="space-y-4">
          {selectedEvent?.event_participants?.map((participant: EventParticipant) => (
            <div key={participant.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {participant.profiles?.avatar_url && (
                  <img 
                    src={participant.profiles.avatar_url} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span>{participant.profiles?.full_name || 'Utilisateur inconnu'}</span>
              </div>
              {onRemoveParticipant && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Voulez-vous retirer ce participant ?')) {
                      onRemoveParticipant(participant.id);
                    }
                  }}
                >
                  Retirer
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}