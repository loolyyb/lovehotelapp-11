import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EventFormValues } from "../types";
import { uploadEventImage } from "../utils/eventUtils";

export function useEventManagement() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: EventFormValues) => {
    try {
      setIsLoading(true);
      let imageUrl = null;
      
      if (values.image) {
        imageUrl = await uploadEventImage(values.image);
      }

      const eventDateTime = new Date(values.event_date);
      const [hours, minutes] = values.start_time.split(':');
      eventDateTime.setHours(parseInt(hours), parseInt(minutes));

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase.from('events').insert({
        title: values.title,
        description: values.description,
        event_date: eventDateTime.toISOString(),
        event_type: values.event_type,
        created_by: userId,
        is_private: values.is_private,
        price: values.free_for_members ? null : values.price,
        free_for_members: values.free_for_members,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast({
        title: "Événement créé",
        description: "L'événement a été créé avec succès",
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
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
    isOpen,
    setIsOpen,
    handleSubmit,
    isLoading,
  };
}