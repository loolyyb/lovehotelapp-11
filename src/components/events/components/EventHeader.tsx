import React from 'react';
import { Card } from "@/components/ui/card";

export function EventHeader() {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold">Calendrier des événements</h2>
      <p className="text-muted-foreground mt-2">
        Découvrez tous nos événements à venir et participez à ceux qui vous intéressent.
      </p>
    </div>
  );
}