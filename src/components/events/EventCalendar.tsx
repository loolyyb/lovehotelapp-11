
import React from 'react';
import { Event } from '@/types/events';
import { EventModal } from './EventModal';
import { Card } from '@/components/ui/card';
import { EventsList } from './EventsList';
import { useEvents } from './hooks/useEvents';
import { useEventParticipation } from './hooks/useEventParticipation';

export function EventCalendar() {
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const { data: events, refetch } = useEvents();
  const { participatingEvents, handleParticipate } = useEventParticipation();

  const handleParticipateWrapper = async (eventId: string) => {
    await handleParticipate(eventId);
    refetch();
  };

  return (
    <Card className="p-6 bg-[#40192C] border-[0.5px] border-[#f3ebad]/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#f3ebad]">Calendrier des événements</h2>
      </div>
      
      <EventsList 
        events={events || []} 
        onParticipate={handleParticipateWrapper}
        participatingEvents={participatingEvents}
      />

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onParticipate={handleParticipateWrapper}
          isParticipating={participatingEvents.includes(selectedEvent.id)}
        />
      )}
    </Card>
  );
}
