
import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { EventFormValues } from "../types";

export interface EventFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Partial<EventFormValues>;
  children: React.ReactNode;
}

export function EventFormDialog({ isOpen, onOpenChange, event, children }: EventFormDialogProps) {
  // Utiliser cloneElement pour passer les données initiales au formulaire
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        initialData: event,
      });
    }
    return child;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {childrenWithProps}
    </Dialog>
  );
}
