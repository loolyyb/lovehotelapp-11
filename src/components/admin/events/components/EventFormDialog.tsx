import React from "react";
import { Dialog } from "@/components/ui/dialog";

export interface EventFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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