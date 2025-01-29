import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Event } from '../types';
import { EventCalendarEventContent } from './EventCalendarEventContent';

interface EventCalendarViewProps {
  events: Event[];
  isMobile: boolean;
  onEventClick: (info: any) => void;
}

export function EventCalendarView({ events, isMobile, onEventClick }: EventCalendarViewProps) {
  return (
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
        eventClick={onEventClick}
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
        eventContent={EventCalendarEventContent}
      />
    </div>
  );
}