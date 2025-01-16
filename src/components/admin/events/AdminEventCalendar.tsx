import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EventForm } from './EventForm';
import { EventFormDialog } from './components/EventFormDialog';
import { useEventManagement } from './hooks/useEventManagement';
import { AdminEventModal } from './components/AdminEventModal';
import { Event } from './types';

export function AdminEventCalendar() {
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const { isOpen, setIsOpen, handleSubmit, isLoading } = useEventManagement();

  const { data: events, refetch } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (error) throw error;

      return data.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.event_date),
        end: new Date(event.event_date),
        extendedProps: {
          description: event.description,
          type: event.event_type,
          isPrivate: event.is_private,
          price: event.price,
          freeForMembers: event.free_for_members,
          imageUrl: event.image_url,
        }
      }));
    }
  });

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
  };

  const handleCreateSuccess = () => {
    setIsOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setSelectedEvent(null);
    refetch();
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gestion des événements</h2>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel événement
        </Button>
      </div>

      <EventFormDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <EventForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onSuccess={handleCreateSuccess}
        />
      </EventFormDialog>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        eventClick={handleEventClick}
        height="auto"
        locale="fr"
        buttonText={{
          today: "Aujourd'hui",
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour',
        }}
      />

      {selectedEvent && (
        <AdminEventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEditSuccess={handleEditSuccess}
          onDeleteSuccess={handleEditSuccess}
        />
      )}
    </Card>
  );
}