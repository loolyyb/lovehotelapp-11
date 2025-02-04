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

export interface EventCardProps {
  id: string;
  title: string;
  type: EventType;
  description: string;
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
  onParticipate: (eventId: string) => void;
}

export const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Speed Dating",
    start: new Date(2024, 0, 24, 19, 0),
    end: new Date(2024, 0, 24, 23, 0),
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