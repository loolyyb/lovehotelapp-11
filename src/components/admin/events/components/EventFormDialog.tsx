import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { EventFormValues } from "../types";

export interface EventFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EventFormValues) => Promise<void>;
  event?: any;
  children: React.ReactNode;
}

export function EventFormDialog({ isOpen, onOpenChange, children }: EventFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}