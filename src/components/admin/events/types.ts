
import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  event_date: z.string().min(1, "La date est requise"),
  start_time: z.string()
    .min(1, "L'heure de début est requise")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:mm)")
    .default("00:00"),
  end_time: z.string()
    .min(1, "L'heure de fin est requise")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:mm)")
    .default("00:00"),
  event_type: z.enum(["bdsm", "jacuzzi", "gastronomy", "speed_dating", "other"]),
  is_private: z.boolean().default(false),
  price: z.number().min(0).nullable(),
  free_for_members: z.boolean().default(true),
  image: z.instanceof(File).optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_time: string;
  event_type: "bdsm" | "jacuzzi" | "gastronomy" | "speed_dating" | "other";
  is_private: boolean;
  price: number | null;
  free_for_members: boolean;
  image_url?: string;
}
