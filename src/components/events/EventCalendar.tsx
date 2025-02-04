import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/events';
import { EventModal } from './EventModal';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

export function EventCalendar() {
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const { toast } = useToast();

  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les événements",
          variant: "destructive",
        });
        throw error;
      }

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

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Calendrier des événements</h2>
      </div>
      
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
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
      />

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </Card>
  );
}