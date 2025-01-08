import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { EventsList } from "./EventsList";
import { sampleEvents } from "@/types/events";

export const EventsCalendar = () => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  );
  const { toast } = useToast();

  const eventsForSelectedDate = sampleEvents.filter(
    (event) =>
      selectedDate &&
      event.date.toDateString() === selectedDate.toDateString()
  );

  const handleParticipate = (eventId: string) => {
    toast({
      title: "Participation enregistrée",
      description: "Vous êtes inscrit à cet événement. Vous recevrez un email de confirmation.",
    });
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
          Découvrez nos soirées thématiques exclusives
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
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};