import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '../types';
import { useToast } from '@/hooks/use-toast';

export function useEvents() {
  const { toast } = useToast();

  return useQuery({
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
}