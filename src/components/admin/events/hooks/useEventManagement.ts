import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventFormValues } from "../types";

export function useEventManagement() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (values: EventFormValues) => {
    try {
      setIsLoading(true);
      const eventDate = new Date(`${values.event_date}T${values.start_time}`);
      const endTime = new Date(`${values.event_date}T${values.end_time}`);
      
      const eventData = {
        title: values.title,
        description: values.description,
        event_date: eventDate.toISOString(),
        end_time: endTime.toTimeString().slice(0, 5),
        event_type: values.event_type,
        is_private: values.is_private,
        price: values.free_for_members ? null : values.price,
        free_for_members: values.free_for_members,
      };

      const { error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      toast({
        title: "Événement créé",
        description: "L'événement a été créé avec succès",
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de l'événement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    isLoading,
    isOpen,
    setIsOpen,
  };
}