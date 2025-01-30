import React from "react";
import { Button } from "@/components/ui/button";

interface EventsHeaderProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export function EventsHeader({
  isCreateModalOpen,
  setIsCreateModalOpen,
}: EventsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Événements</h2>
        <p className="text-muted-foreground">
          Gérez les événements de votre plateforme
        </p>
      </div>
      <Button onClick={() => setIsCreateModalOpen(true)}>
        Créer un événement
      </Button>
    </div>
  );
}