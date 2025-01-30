import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/components/events/components/EventForm";
import { EventFormValues } from "@/components/events/types";

interface CreateEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EventFormValues) => Promise<void>;
  isLoading: boolean;
}

export function CreateEventDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateEventDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          Créer un événement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <EventForm 
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}