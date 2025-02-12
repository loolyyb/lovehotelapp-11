
import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { EventFormValues } from "../types";
import { EventForm, EventFormProps } from "../EventForm";

export interface EventFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Partial<EventFormValues>;
  children: React.ReactElement<EventFormProps>;
}

export function EventFormDialog({ isOpen, onOpenChange, event, children }: EventFormDialogProps) {
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
        initialData: event,
      } as EventFormProps);
    }
    return child;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {childrenWithProps}
    </Dialog>
  );
}
