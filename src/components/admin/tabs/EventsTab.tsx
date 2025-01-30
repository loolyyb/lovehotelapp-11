import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Event } from "@/types/events";
import { EventTable } from "./events/EventTable";
import { ParticipantsList } from "./events/ParticipantsList";
import { EventsHeader } from "./events/EventsHeader";
import { EventFormModal } from "./events/EventFormModal";
import { useEvents } from "@/hooks/useEvents";

export function EventsTab() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

  const {
    events,
    isLoading,
    createEventMutation,
    updateEventMutation,
    deleteEventMutation
  } = useEvents();

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

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
      />

      <EventTable
        events={events}
        onEdit={handleEditEvent}
        onDelete={(eventId) => deleteEventMutation.mutate(eventId)}
        onShowParticipants={(event) => {
          setSelectedEvent(event);
          setIsParticipantsModalOpen(true);
        }}
        isUpdateLoading={updateEventMutation.isPending}
      />

      <EventFormModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={async (values) => {
          await createEventMutation.mutateAsync(values);
          setIsCreateModalOpen(false);
        }}
        isLoading={createEventMutation.isPending}
        mode="create"
      />

      <EventFormModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={async (values) => {
          await updateEventMutation.mutateAsync({ ...values, id: selectedEvent?.id });
          setIsEditModalOpen(false);
          setSelectedEvent(null);
        }}
        isLoading={updateEventMutation.isPending}
        event={selectedEvent}
        mode="edit"
      />

      <ParticipantsList
        isOpen={isParticipantsModalOpen}
        onOpenChange={setIsParticipantsModalOpen}
        selectedEvent={selectedEvent}
      />
    </div>
  );
}