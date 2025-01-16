export type EventType = "bdsm" | "jacuzzi" | "gastronomy" | "speed_dating" | "other";

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  extendedProps: {
    description: string;
    type: EventType;
    isPrivate: boolean;
    price: number | null;
    freeForMembers: boolean;
    imageUrl?: string;
  };
}

export const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Speed Dating",
    start: new Date(2024, 0, 24, 19, 0), // January 24, 2024, 19:00
    end: new Date(2024, 0, 24, 23, 0),   // January 24, 2024, 23:00
    extendedProps: {
      description: "Une soirée de rencontres rapides dans une ambiance chaleureuse et décontractée.",
      type: "speed_dating",
      isPrivate: false,
      price: null,
      freeForMembers: true,
      imageUrl: "https://media.istockphoto.com/id/1317810289/fr/vectoriel/jeune-homme-et-femme-sasseyant-%C3%A0-la-table-et-parlant.jpg?s=612x612&w=0&k=20&c=-UzHEeczHYiQIoFirPugh1ockhVz-CY5ontY6vCCOzg="
    }
  }
];