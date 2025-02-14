
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useEventParticipation() {
  const [participatingEvents, setParticipatingEvents] = useState<string[]>([]);
  const { toast } = useToast();

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

  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetchParticipatingEvents(user.id);
      }
    };
    
    checkCurrentUser();
  }, []);

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
        const { error } = await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'registered'
          });

        if (error) {
          if (error.code === '23505') {
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
    } catch (error) {
      console.error('Error managing event participation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la gestion de votre participation",
        variant: "destructive",
      });
    }
  };

  return {
    participatingEvents,
    handleParticipate
  };
}
