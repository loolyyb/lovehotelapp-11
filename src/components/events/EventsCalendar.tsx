import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Types pour les événements
type EventType = "bdsm" | "jacuzzi" | "gastronomy" | "speed_dating" | "other";

interface Event {
  id: string;
  title: string;
  date: Date;
  type: EventType;
  description: string;
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
}

// Exemple d'événements (à remplacer par des données réelles de la base de données)
const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Speed Dating",
    date: new Date(2024, 0, 24), // January 24, 2024
    type: "speed_dating",
    description: "Une soirée de rencontres rapides dans une ambiance chaleureuse et décontractée.",
    imageUrl: "/speed-dating.jpg", // Make sure this image exists in your public folder
    startTime: "19:00",
    endTime: "23:00"
  },
  {
    id: "2",
    title: "Soirée BDSM",
    date: new Date(2024, 3, 15),
    type: "bdsm",
    description: "Découvrez l'univers du BDSM dans un cadre sécurisé et bienveillant.",
  },
  {
    id: "3",
    title: "Jacuzzi Party",
    date: new Date(2024, 3, 20),
    type: "jacuzzi",
    description: "Une soirée relaxante dans nos jacuzzis privatifs.",
  },
  {
    id: "4",
    title: "Dégustation Gastronomique",
    date: new Date(2024, 3, 25),
    type: "gastronomy",
    description: "Un voyage culinaire exceptionnel préparé par notre chef étoilé.",
  },
];

const getEventTypeColor = (type: EventType) => {
  switch (type) {
    case "bdsm":
      return "bg-burgundy-600 hover:bg-burgundy-700";
    case "jacuzzi":
      return "bg-blue-600 hover:bg-blue-700";
    case "gastronomy":
      return "bg-rose-600 hover:bg-rose-700";
    case "speed_dating":
      return "bg-pink-600 hover:bg-pink-700";
    default:
      return "bg-gray-600 hover:bg-gray-700";
  }
};

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
            {eventsForSelectedDate.length > 0 ? (
              <div className="space-y-4">
                {eventsForSelectedDate.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-lg bg-white shadow-md"
                  >
                    {event.imageUrl && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-cormorant font-semibold">
                          {event.title}
                        </h3>
                        {event.startTime && event.endTime && (
                          <p className="text-sm text-gray-600 mt-1">
                            {event.startTime} - {event.endTime}
                          </p>
                        )}
                      </div>
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-gray-600 font-montserrat text-sm mb-4">
                      {event.description}
                    </p>
                    <Button 
                      onClick={() => handleParticipate(event.id)}
                      className="w-full bg-burgundy hover:bg-burgundy-600 text-white"
                    >
                      Participer
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun événement prévu pour cette date
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
