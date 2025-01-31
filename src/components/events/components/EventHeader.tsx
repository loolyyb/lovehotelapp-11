import React from 'react';
import { Card } from "@/components/ui/card";

export function EventHeader() {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold">Calendrier des événements - disponible dès le 15 février 2025</h2>
      <p className="text-muted-foreground mt-2">
        Disponible dès le 15 février 2025
      </p>
    </div>
  );
}