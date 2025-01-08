import React from "react";
import { EventCard } from "./EventCard";
import { Event } from "@/types/events";

interface EventsListProps {
  events: Event[];
  onParticipate: (eventId: string) => void;
}

export const EventsList = ({ events, onParticipate }: EventsListProps) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun événement prévu pour cette date
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          {...event}
          onParticipate={onParticipate}
        />
      ))}
    </div>
  );
};