
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EventForm } from "./EventForm";
import { EventFormDialog } from "./components/EventFormDialog";
import { useEventManagement } from "./hooks/useEventManagement";
import { EventsTable } from "./EventsTable";

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
        />
      </EventFormDialog>

      <EventsTable events={events} />
    </Card>
  );
}
