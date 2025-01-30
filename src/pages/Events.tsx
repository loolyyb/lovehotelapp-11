import React from "react";
import { EventCalendar } from "@/components/events/EventCalendar";
import { useToast } from "@/hooks/use-toast";

const Events = () => {
  const { toast } = useToast();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Agenda des événements - Option disponible à partir du 15 février 2025
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Découvrez et participez à nos événements exclusifs
      </p>
      <EventCalendar />
    </div>
  );
};

export default Events;