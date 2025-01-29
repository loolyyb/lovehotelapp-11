import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event } from './types';
import { EventModal } from './EventModal';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { EventHeader } from './components/EventHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { EventForm } from './components/EventForm';
import { useAuthSession } from '@/hooks/useAuthSession';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Database } from '@/integrations/supabase/types';

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <EventHeader />
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select
              value={selectedEventType}
              onValueChange={(value: EventType | 'all') => setSelectedEventType(value)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Type d'événement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les événements</SelectItem>
                <SelectItem value="bdsm">BDSM</SelectItem>
                <SelectItem value="jacuzzi">Jacuzzi</SelectItem>
                <SelectItem value="gastronomy">Gastronomie</SelectItem>
                <SelectItem value="speed_dating">Speed Dating</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>

            {isAdmin && (
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un événement
                  </Button>
                </DialogTrigger>
                <EventForm 
                  onSubmit={handleCreateEvent}
                  isLoading={createEventMutation.isPending}
                />
              </Dialog>
            )}
          </div>
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
            eventContent={(eventInfo) => {
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