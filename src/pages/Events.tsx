import React from "react";
import { EventsCalendar } from "@/components/events/EventsCalendar";

const Events = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Calendrier des événements</h1>
      <EventsCalendar />
    </div>
  );
};

export default Events;