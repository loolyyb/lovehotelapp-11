import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Event } from './types';
import { EventModal } from './EventModal';
import { Card } from '@/components/ui/card';
import { EventHeader } from './components/EventHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useEvents } from './hooks/useEvents';
import { EventCalendarLoading } from './components/EventCalendarLoading';

export function EventCalendar() {
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const isMobile = useIsMobile();
  const { session, userProfile } = useAuthSession();
  const { data: events, isLoading } = useEvents();

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
  };

  const handleParticipationSuccess = () => {
    setSelectedEvent(null);
  };

  if (isLoading) {
    return <EventCalendarLoading />;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4">
      <Card className="p-2 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <EventHeader />
        </div>
        
        <div className="mt-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView={isMobile ? "dayGridDay" : "dayGridMonth"}
            headerToolbar={{
              left: isMobile ? 'prev,next' : 'prev,next today',
              center: 'title',
              right: isMobile ? 'dayGridDay,dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay'
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
            dayHeaderFormat={{
              weekday: isMobile ? 'short' : 'long',
              day: 'numeric',
              omitCommas: true
            }}
            views={{
              dayGrid: {
                titleFormat: { year: 'numeric', month: 'long' }
              },
              timeGrid: {
                titleFormat: { year: 'numeric', month: 'long' }
              },
              dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' }
              }
            }}
          />
        </div>

        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onParticipationSuccess={handleParticipationSuccess}
          />
        )}
      </Card>
    </div>
  );
}