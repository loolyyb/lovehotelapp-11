import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/events";
import { EventForm } from "./events/EventForm";
import { EventList } from "./events/EventList";
import { useEvents } from "./events/useEvents";

export function EventsManager() {
  const [isCreating, setIsCreating] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState<Partial<Event>>({
    title: "",
    description: "",
    type: "other",
    date: new Date(),
    max_participants: null,
    location: "",
    price: null,
  });

  const { events, isLoading, createEvent, deleteEvent } = useEvents();

  const handleCreateEvent = async () => {
    const success = await createEvent(newEvent);
    if (success) {
      setIsCreating(false);
      setNewEvent({
        title: "",
        description: "",
        type: "other",
        date: new Date(),
        max_participants: null,
        location: "",
        price: null,
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gestion des évènements</h2>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Annuler" : "Créer un évènement"}
        </Button>
      </div>

      {isCreating && (
        <EventForm
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          onSubmit={handleCreateEvent}
          onCancel={() => setIsCreating(false)}
        />
      )}

      <EventList
        events={events || []}
        isLoading={isLoading}
        onDelete={deleteEvent}
      />
    </Card>
  );
}