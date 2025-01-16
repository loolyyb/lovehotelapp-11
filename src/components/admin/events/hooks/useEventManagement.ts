import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLogger } from "@/hooks/useLogger";
import { supabase } from "@/integrations/supabase/client";
import { EventFormValues, Event } from "../types";
import { uploadEventImage, createEvent } from "../utils/eventUtils";

export function useEventManagement() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const logger = useLogger('EventManagement');

  const { data: events, refetch } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      return data as Event[];
    }
  });

  const handleSubmit = async (values: EventFormValues) => {
    try {
      setIsLoading(true);
      let imageUrl = null;
      
      if (values.image) {
        imageUrl = await uploadEventImage(values.image);
      }

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const { error } = await createEvent(values, userId, imageUrl);

      if (error) {
        logger.error('Error creating event:', { error, values });
        throw error;
      }

      setIsOpen(false);
      refetch();
    } catch (error) {
      logger.error('Error in handleSubmit:', { error });
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'événement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    events,
    isOpen,
    setIsOpen,
    handleSubmit,
    isLoading,
  };
}