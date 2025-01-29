import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event } from './types';
import { EventModal } from './EventModal';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Database } from '@/integrations/supabase/types';
import { EventCalendarHeader } from './calendar/EventCalendarHeader';
import { EventCalendarView } from './calendar/EventCalendarView';

type EventType = Database['public']['Enums']['event_type'];

export function EventCalendar() {
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedEventType, setSelectedEventType] = React.useState<EventType | 'all'>('all');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { session, userProfile } = useAuthSession();
  const isAdmin = userProfile?.role === 'admin';

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', selectedEventType],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*, event_participants(*)');

      if (selectedEventType !== 'all') {
        query = query.eq('event_type', selectedEventType);
      }

      const { data, error } = await query;

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
          waitingList: event.event_participants.length >= (event.max_participants || 0),
          participantCount: event.event_participants.length,
          maxParticipants: event.max_participants,
        }
      }));
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (values: any) => {
      if (!session?.user?.id) throw new Error("Vous devez être connecté");

      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...values,
          created_by: session.user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Succès",
        description: "L'événement a été créé avec succès",
      });
      setIsCreateModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'événement",
        variant: "destructive",
      });
      console.error('Error creating event:', error);
    }
  });

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
  };

  const handleParticipationSuccess = () => {
    setSelectedEvent(null);
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  const handleCreateEvent = async (values: any) => {
    createEventMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4">
      <Card className="p-2 sm:p-6">
        <EventCalendarHeader
          selectedEventType={selectedEventType}
          setSelectedEventType={setSelectedEventType}
          isAdmin={isAdmin}
          isCreateModalOpen={isCreateModalOpen}
          setIsCreateModalOpen={setIsCreateModalOpen}
          handleCreateEvent={handleCreateEvent}
          createEventMutation={createEventMutation}
        />
        
        <EventCalendarView
          events={events || []}
          isMobile={isMobile}
          onEventClick={handleEventClick}
        />

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