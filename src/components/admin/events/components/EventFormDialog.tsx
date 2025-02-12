
import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { EventFormValues } from "../types";
import { EventForm } from "../EventForm";

export interface EventFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Partial<EventFormValues>;
  children: React.ReactElement<typeof EventForm>;
}

export function EventFormDialog({ isOpen, onOpenChange, event, children }: EventFormDialogProps) {
  // On type correctement l'enfant et ses props
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
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
