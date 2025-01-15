export type EventType = "bdsm" | "jacuzzi" | "gastronomy" | "speed_dating" | "other";

export interface Event {
  id: string;
  title: string;
  description: string;  // Made required to match EventCard requirements
  type: EventType;
  date: Date;
  location?: string;
  max_participants?: number | null;
  price?: number | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Speed Dating",
    date: new Date(2024, 0, 24),
    type: "speed_dating",
    description: "Une soirée de rencontres rapides dans une ambiance chaleureuse et décontractée.",
    location: "Paris",
    max_participants: 20,
    price: 25
  },
  {
    id: "2",
    title: "Soirée BDSM",
    date: new Date(2024, 3, 15),
    type: "bdsm",
    description: "Découvrez l'univers du BDSM dans un cadre sécurisé et bienveillant.",
    location: "Dungeon Room",
    max_participants: 15,
    price: 30
  },
  {
    id: "3",
    title: "Jacuzzi Party",
    date: new Date(2024, 3, 20),
    type: "jacuzzi",
    description: "Une soirée relaxante dans nos jacuzzis privatifs.",
    location: "Spa Area",
    max_participants: 10,
    price: 40
  },
  {
    id: "4",
    title: "Dégustation Gastronomique",
    date: new Date(2024, 3, 25),
    type: "gastronomy",
    description: "Un voyage culinaire exceptionnel préparé par notre chef étoilé.",
    location: "Restaurant",
    max_participants: 30,
    price: 50
  }
];