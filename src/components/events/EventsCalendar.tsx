
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { EventsList } from "./EventsList";
import { sampleEvents } from "@/types/events";
import { supabase } from "@/integrations/supabase/client";

export const EventsCalendar = () => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date(2024, 0, 24) // Set initial date to January 24, 2024
  );
  const [participatingEvents, setParticipatingEvents] = React.useState<string[]>([]);
  const { toast } = useToast();

  const eventsForSelectedDate = React.useMemo(() => {
    if (!selectedDate) return [];
    
    return sampleEvents.filter((event) => {
      const eventDate = event.start;
      const selected = new Date(selectedDate);
      
      return (
        eventDate.getFullYear() === selected.getFullYear() &&
        eventDate.getMonth() === selected.getMonth() &&
        eventDate.getDate() === selected.getDate()
      );
    });
  }, [selectedDate]);

  React.useEffect(() => {
    const fetchParticipatingEvents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching participations:', error);
        return;
      }

      setParticipatingEvents(data.map(p => p.event_id));
    };

    fetchParticipatingEvents();
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

      // Vérifier si l'utilisateur est déjà inscrit
      const { data: existingParticipation } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existingParticipation) {
        // Si l'utilisateur est déjà inscrit, on le désinscrit
        const { error: deleteError } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        setParticipatingEvents(prev => prev.filter(id => id !== eventId));
        toast({
          title: "Succès",
          description: "Vous êtes désinscrit de cet événement",
        });
      } else {
        // Si l'utilisateur n'est pas inscrit, on l'inscrit
        const { error: insertError } = await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'registered'
          });

        if (insertError) throw insertError;

        setParticipatingEvents(prev => [...prev, eventId]);
        toast({
          title: "Succès",
          description: "Votre participation a été enregistrée",
        });
      }
    } catch (error: any) {
      console.error('Error managing event participation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la gestion de votre participation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-cormorant font-bold text-gray-900 mb-2">
          Calendrier des Événements
        </h2>
        <p className="text-gray-600 font-montserrat">
          Découvrez nos évènements thématiques exclusives
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-4 bg-cream/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-cormorant">
              Sélectionnez une date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border shadow"
              defaultMonth={new Date(2024, 0)}
            />
          </CardContent>
        </Card>

        <Card className="p-4 bg-cream/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-cormorant">
              Événements{" "}
              {selectedDate && (
                <span className="text-burgundy">
                  {selectedDate.toLocaleDateString()}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EventsList 
              events={eventsForSelectedDate}
              onParticipate={handleParticipate}
              participatingEvents={participatingEvents}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
