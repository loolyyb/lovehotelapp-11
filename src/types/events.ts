export type EventType = "bdsm" | "jacuzzi" | "gastronomy" | "speed_dating" | "other";

export interface Event {
  id: string;
  title: string;
  description?: string;
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
    date: new Date(2024, 0, 24), // January 24, 2024
    type: "speed_dating",
    description: "Une soirée de rencontres rapides dans une ambiance chaleureuse et décontractée.",
    imageUrl: "https://media.istockphoto.com/id/1317810289/fr/vectoriel/jeune-homme-et-femme-sasseyant-%C3%A0-la-table-et-parlant.jpg?s=612x612&w=0&k=20&c=-UzHEeczHYiQIoFirPugh1ockhVz-CY5ontY6vCCOzg=",
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