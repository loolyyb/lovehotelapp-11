import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { EventForm } from "@/components/events/components/EventForm";
import { EventsHeader } from "../events/EventsHeader";
import { EventsTable } from "../events/EventsTable";
import { useEventMutations } from "../events/useEventMutations";

export function EventsTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const { createMutation, deleteMutation } = useEventMutations();

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_participants (
            id,
            user_id,
            status
          )
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EventsHeader onCreateClick={() => setIsCreateDialogOpen(true)} />

      <Dialog 
        open={isCreateDialogOpen} 
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            // Reset form state when dialog is closed
            createMutation.reset();
          }
        }}
      >
        <EventForm 
          onSubmit={async (values) => {
            try {
              await createMutation.mutateAsync(values);
              setIsCreateDialogOpen(false);
            } catch (error) {
              console.error('Error creating event:', error);
            }
          }}
          isLoading={createMutation.isPending}
        />
      </Dialog>

      <EventsTable 
        events={events || []}
        onDelete={(eventId) => deleteMutation.mutate(eventId)}
        onEdit={(event) => {
          // TODO: Implement edit functionality
          console.log('Edit event:', event);
        }}
        onViewParticipants={(event) => {
          // TODO: Implement view participants functionality
          console.log('View participants:', event);
        }}
      />
    </div>
  );
}