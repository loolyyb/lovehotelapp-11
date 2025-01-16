import React from "react";
import { Card } from "@/components/ui/card";
import { EventFormDialog } from "./components/EventFormDialog";
import { EventsTable } from "./EventsTable";
import { useEventManagement } from "./hooks/useEventManagement";

export function EventsManager() {
  const { events, isOpen, setIsOpen, handleSubmit } = useEventManagement();

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gestion des événements</h2>
        <EventFormDialog
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSubmit={handleSubmit}
        />
      </div>
      <EventsTable events={events} />
    </Card>
  );
}