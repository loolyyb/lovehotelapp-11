import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// Types pour les événements
type EventType = "bdsm" | "jacuzzi" | "gastronomy" | "other";

interface Event {
  id: string;
  title: string;
  date: Date;
  type: EventType;
  description: string;
}

// Exemple d'événements (à remplacer par des données réelles de la base de données)
const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Soirée BDSM",
    date: new Date(2024, 3, 15),
    type: "bdsm",
    description: "Découvrez l'univers du BDSM dans un cadre sécurisé et bienveillant.",
  },
  {
    id: "2",
    title: "Jacuzzi Party",
    date: new Date(2024, 3, 20),
    type: "jacuzzi",
    description: "Une soirée relaxante dans nos jacuzzis privatifs.",
  },
  {
    id: "3",
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
    default:
      return "bg-gray-600 hover:bg-gray-700";
  }
};

export const EventsCalendar = () => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  );

  const eventsForSelectedDate = sampleEvents.filter(
    (event) =>
      selectedDate &&
      event.date.toDateString() === selectedDate.toDateString()
  );

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
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-cormorant font-semibold">
                        {event.title}
                      </h3>
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                    <p className="text-gray-600 font-montserrat text-sm">
                      {event.description}
                    </p>
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