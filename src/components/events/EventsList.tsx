
import React from "react";
import { EventCard } from "./EventCard";
import { Event } from "@/types/events";

interface EventsListProps {
  events: Event[];
  onParticipate: (eventId: string) => void;
  participatingEvents: string[];
}

export const EventsList = ({ events, onParticipate, participatingEvents }: EventsListProps) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun événement prévu pour cette date
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          id={event.id}
          title={event.title}
          type={event.extendedProps.type}
          description={event.extendedProps.description}
          imageUrl={event.extendedProps.imageUrl}
          date={formatDate(event.start)}
          startTime={formatTime(event.start)}
          endTime={formatTime(event.end)}
          onParticipate={onParticipate}
          isParticipating={participatingEvents.includes(event.id)}
        />
      ))}
    </div>
  );
};
