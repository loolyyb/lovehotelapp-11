
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

      // D'abord, vérifions si un profil existe pour cet utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        throw profileError;
      }

      // Si aucun profil n'existe, on en crée un
      if (!profile) {
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.email?.split('@')[0] || 'Nouveau membre',
            role: 'user',
            relationship_type: [],
            seeking: [],
            photo_urls: [],
            is_love_hotel_member: false,
            is_loolyb_holder: false
          });

        if (createProfileError) {
          console.error('Error creating profile:', createProfileError);
          throw createProfileError;
        }
      }

      // Maintenant on peut enregistrer la participation
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

      // Refresh events list
      refetch();

      // Find and show event details
      const event = events?.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre participation",
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
        />
      )}
    </Card>
  );
}
