import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Event } from "@/types/events";
import { EventTable } from "./events/EventTable";
import { ParticipantsList } from "./events/ParticipantsList";
import { EventsHeader } from "./events/EventsHeader";
import { useEvents } from "@/hooks/useEvents";

export function EventsTab() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

  const {
    events,
    isLoading,
    createEventMutation,
    updateEventMutation,
    deleteEventMutation
  } = useEvents();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EventsHeader
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        onCreateEvent={async (values) => {
          await createEventMutation.mutateAsync(values);
          setIsCreateModalOpen(false);
        }}
        isCreating={createEventMutation.isPending}
      />

      <EventTable
        events={events}
        onEdit={setSelectedEvent}
        onDelete={(eventId) => deleteEventMutation.mutate(eventId)}
        onShowParticipants={(event) => {
          setSelectedEvent(event);
          setIsParticipantsModalOpen(true);
        }}
        isUpdateLoading={updateEventMutation.isPending}
      />

      <ParticipantsList
        isOpen={isParticipantsModalOpen}
        onOpenChange={setIsParticipantsModalOpen}
        selectedEvent={selectedEvent}
      />
    </div>
  );
}