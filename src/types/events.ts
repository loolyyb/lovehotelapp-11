import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  event_date: z.string().min(1, "La date est requise"),
  start_time: z.string().min(1, "L'heure de début est requise"),
  end_time: z.string().min(1, "L'heure de fin est requise"),
  event_type: z.enum(["bdsm", "jacuzzi", "gastronomy", "speed_dating", "other"]),
  is_private: z.boolean().default(false),
  price: z.number().min(0).nullable(),
  free_for_members: z.boolean().default(true),
  image: z.instanceof(File).optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;

export type EventType = "bdsm" | "jacuzzi" | "gastronomy" | "speed_dating" | "other";

export interface EventParticipant {
  id: string;
  user_id: string;
  status: string;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_type: EventType;
  is_private: boolean;
  price: number | null;
  free_for_members: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  event_participants?: EventParticipant[];
}

// Sample events for the calendar demo
export const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Soirée BDSM",
    description: "Une soirée thématique BDSM exclusive",
    event_date: "2024-01-24T19:00:00",
    event_type: "bdsm",
    is_private: true,
    price: 50,
    free_for_members: true,
    created_by: "system",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    event_participants: []
  },
  {
    id: "2",
    title: "Jacuzzi Party",
    description: "Détente et plaisir dans notre espace jacuzzi",
    event_date: "2024-01-24T20:00:00",
    event_type: "jacuzzi",
    is_private: false,
    price: 30,
    free_for_members: true,
    created_by: "system",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    event_participants: []
  }
];