import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { EventForm } from "@/components/events/components/EventForm";
import { EventsTable } from "./events/EventsTable";
import { DeleteEventDialog } from "./events/DeleteEventDialog";
import { useEvents } from "./events/useEvents";

export function EventsTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const {
    events,
    isLoading,
    createEventMutation,
    updateEventMutation,
    deleteEventMutation,
  } = useEvents();

  const handleEditClick = (event: any) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (event: any) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des événements</h2>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              Créer un événement
            </Button>
          </DialogTrigger>
          <EventForm 
            onSubmit={async (values) => {
              await createEventMutation.mutateAsync(values);
              setIsCreateModalOpen(false);
            }}
            isLoading={createEventMutation.isPending}
          />
        </Dialog>
      </div>

      <EventsTable 
        events={events || []}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        {selectedEvent && (
          <EventForm
            initialData={selectedEvent}
            onSubmit={async (values) => {
              await updateEventMutation.mutateAsync({
                ...values,
                id: selectedEvent.id,
              });
              setIsEditModalOpen(false);
              setSelectedEvent(null);
            }}
            isLoading={updateEventMutation.isPending}
          />
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteEventDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
          if (selectedEvent) {
            deleteEventMutation.mutate(selectedEvent.id);
            setIsDeleteDialogOpen(false);
            setSelectedEvent(null);
          }
        }}
        isLoading={deleteEventMutation.isPending}
      />
    </div>
  );
}