import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  event_date: z.string().min(1, "La date est requise"),
  event_type: z.enum(["bdsm", "jacuzzi", "gastronomy", "speed_dating", "other"]),
  is_private: z.boolean().default(false),
  price: z.number().min(0).nullable(),
  free_for_members: z.boolean().default(true),
  image_url: z.string().optional(),
  max_participants: z.number().min(0).optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;

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
    waitingList: boolean;
    participantCount: number;
    maxParticipants?: number;
  };
}