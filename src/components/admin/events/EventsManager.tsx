
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EventForm } from "./EventForm";
import { EventFormDialog } from "./components/EventFormDialog";
import { useEventManagement } from "./hooks/useEventManagement";
import { EventsTable } from "./EventsTable";
import { Event } from "./types";

export function EventsManager() {
  const { handleSubmit, isLoading, isOpen, setIsOpen } = useEventManagement();
  const [editingEvent, setEditingEvent] = React.useState<any>(null);

  const { data: events } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const handleFormSubmit = async (values: any) => {
    await handleSubmit(values, editingEvent?.id);
  };

  const handleEdit = (event: Event) => {
    // Convertir la date de l'événement
    const eventDate = new Date(event.event_date);
    
    // Formater l'heure de début depuis la date de l'événement
    const startTime = eventDate.toTimeString().substring(0, 5);
    
    // Formater l'heure de fin (si elle existe)
    const endTime = event.end_time ? event.end_time.substring(0, 5) : "00:00";

    const formattedEvent = {
      ...event,
      event_date: eventDate.toISOString().split('T')[0],
      start_time: startTime,
      end_time: endTime,
      price: event.price || 0,
      free_for_members: event.free_for_members === null ? true : event.free_for_members,
    };

    console.log("Formatted event for editing:", formattedEvent);
    setEditingEvent(formattedEvent);
    setIsOpen(true);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gestion des événements</h2>
        <Button onClick={() => {
          setEditingEvent(null);
          setIsOpen(true);
        }}>
          Nouvel événement
        </Button>
      </div>

      <EventFormDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        event={editingEvent}
      >
        <EventForm
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
          initialData={editingEvent}
        />
      </EventFormDialog>

      <EventsTable events={events} onEdit={handleEdit} />
    </Card>
  );
}
