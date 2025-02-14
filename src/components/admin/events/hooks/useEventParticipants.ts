
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEventParticipants() {
  const { data: participants, refetch: refetchParticipants } = useQuery({
    queryKey: ['event-participants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_participants_with_profiles')
        .select('*')
        .order('registered_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const getParticipantsForEvent = (eventId: string) => {
    return participants?.filter(p => p.event_id === eventId) || [];
  };

  return {
    participants,
    refetchParticipants,
    getParticipantsForEvent
  };
}
