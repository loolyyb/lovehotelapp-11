
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
import { useIsMobile } from '@/hooks/use-mobile';
import { EventsList } from './EventsList';

export function EventCalendar() {
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [participatingEvents, setParticipatingEvents] = React.useState<string[]>([]);

  const { data: events, refetch } = useQuery({
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

  // Fetch user's participating events
  const fetchParticipatingEvents = async (userId: string) => {
    const { data, error } = await supabase
      .from('event_participants')
      .select('event_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching participations:', error);
      return;
    }

    setParticipatingEvents(data.map(p => p.event_id));
  };

  React.useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetchParticipatingEvents(user.id);
      }
    };
    
    checkCurrentUser();
  }, []);

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
  };

  const handleParticipate = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour participer à un événement",
          variant: "destructive",
        });
        return;
      }

      // Si l'utilisateur participe déjà, on le désinscrit
      if (participatingEvents.includes(eventId)) {
        const { error } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Vous êtes désinscrit de l'événement",
        });

        setParticipatingEvents(prev => prev.filter(id => id !== eventId));
      } else {
        // Sinon, on l'inscrit
        const { error } = await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'registered'
          });

        if (error) {
          if (error.code === '23505') { // Unique violation
            toast({
              title: "Information",
              description: "Vous êtes déjà inscrit à cet événement",
            });
            return;
          }
          throw error;
        }

        toast({
          title: "Succès",
          description: "Votre participation a été enregistrée",
        });

        setParticipatingEvents(prev => [...prev, eventId]);
      }

      // Refresh events list
      refetch();

      // Find and show event details
      const event = events?.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
      }
    } catch (error) {
      console.error('Error managing event participation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la gestion de votre participation",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Calendrier des événements</h2>
      </div>
      
      {isMobile ? (
        <EventsList 
          events={events || []} 
          onParticipate={handleParticipate}
          participatingEvents={participatingEvents}
        />
      ) : (
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
      )}

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onParticipate={handleParticipate}
          isParticipating={participatingEvents.includes(selectedEvent.id)}
        />
      )}
    </Card>
  );
}
