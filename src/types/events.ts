export type EventType = "bdsm" | "jacuzzi" | "gastronomy" | "speed_dating" | "other";

export interface Event {
  id: string;
  title: string;
  date: Date;
  type: EventType;
  description: string;
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
}

export const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Speed Dating",
    date: new Date(2024, 0, 24), // January 24, 2024
    type: "speed_dating",
    description: "Une soirée de rencontres rapides dans une ambiance chaleureuse et décontractée.",
    imageUrl: "/lovable-uploads/7166d2b9-9fbe-4515-a474-a2934c999786.png",
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