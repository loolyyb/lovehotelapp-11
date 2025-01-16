import React from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventForm } from "../EventForm";
import { EventFormValues } from "../types";

interface EventFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EventFormValues) => Promise<void>;
}

export function EventFormDialog({ isOpen, onOpenChange, onSubmit }: EventFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Nouvel événement</Button>
      </DialogTrigger>
      <EventForm onSubmit={onSubmit} />
    </Dialog>
  );
}