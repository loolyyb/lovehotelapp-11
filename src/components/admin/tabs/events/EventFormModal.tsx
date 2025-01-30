import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventForm } from "@/components/events/components/EventForm";
import { Event } from "@/types/events";

interface EventFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: any) => Promise<void>;
  isLoading: boolean;
  event?: Event | null;
  mode: "create" | "edit";
}

export function EventFormModal({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
  event,
  mode
}: EventFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Créer un nouvel événement" : "Modifier l'événement"}
          </DialogTitle>
        </DialogHeader>
        <EventForm 
          onSubmit={onSubmit}
          isLoading={isLoading}
          initialData={event}
        />
      </DialogContent>
    </Dialog>
  );
}