import React from 'react';
import { Badge } from "@/components/ui/badge";
import { EventContentArg } from '@fullcalendar/core';

export function EventCalendarEventContent(eventInfo: EventContentArg) {
  const event = eventInfo.event;
  
  return (
    <div className="p-1">
      <div className="font-semibold text-sm">{event.title}</div>
      <div className="flex gap-1 mt-1 flex-wrap">
        <Badge variant="secondary" className="text-xs">
          {event.extendedProps.type}
        </Badge>
        {event.extendedProps.waitingList && (
          <Badge variant="destructive" className="text-xs">
            Liste d'attente
          </Badge>
        )}
        {event.extendedProps.participantCount}/{event.extendedProps.maxParticipants}
      </div>
    </div>
  );
}