import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { EventForm } from "./EventForm";
import { EventsTable } from "./EventsTable";
import { Event, EventFormValues } from "./types";

export function EventsManager() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);

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

  const onSubmit = async (values: EventFormValues) => {
    try {
      const { error } = await supabase.from('events').insert([{
        title: values.title,
        description: values.description,
        event_date: values.event_date,
        event_type: values.event_type,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        is_private: values.is_private,
        price: values.free_for_members ? null : values.price,
        free_for_members: values.free_for_members,
      }]);

      if (error) throw error;

      toast({
        title: "Événement créé",
        description: "L'événement a été créé avec succès",
      });

      setIsOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'événement",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gestion des événements</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Nouvel événement</Button>
          </DialogTrigger>
          <EventForm onSubmit={onSubmit} />
        </Dialog>
      </div>
      <EventsTable events={events} />
    </Card>
  );
}