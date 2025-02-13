
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventFormValues } from "../types";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export function useEventManagement() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSubmit = async (values: EventFormValues, eventId?: string) => {
    try {
      setIsLoading(true);
      console.log("Form values:", values);
      
      // Vérifier l'authentification de l'utilisateur
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Authentication error:", authError);
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour créer un événement",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      // Format the event date with the start time
      const eventDate = new Date(`${values.event_date}T${values.start_time}`);
      console.log("Formatted event date:", eventDate);
      
      const eventData = {
        title: values.title,
        description: values.description,
        event_date: eventDate.toISOString(),
        end_time: values.end_time,
        event_type: values.event_type,
        is_private: values.is_private,
        price: values.free_for_members ? null : values.price,
        free_for_members: values.free_for_members,
        created_by: user.id // Ajout de l'ID de l'utilisateur
      };

      console.log("Event data to save:", eventData);
      let error;
      
      if (eventId) {
        const { error: updateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', eventId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('events')
          .insert(eventData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: eventId ? "Événement modifié" : "Événement créé",
        description: eventId 
          ? "L'événement a été modifié avec succès"
          : "L'événement a été créé avec succès",
      });

      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
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
