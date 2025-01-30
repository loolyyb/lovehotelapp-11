import React from "react";
import { Button } from "@/components/ui/button";

interface EventsHeaderProps {
  onCreateClick: () => void;
}

export function EventsHeader({ onCreateClick }: EventsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Gestion des événements</h2>
      <Button onClick={onCreateClick} variant="default">
        Créer un événement
      </Button>
    </div>
  );
}