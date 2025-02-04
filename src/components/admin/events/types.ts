import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

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
  image: z
    .instanceof(File)
    .refine((file) => file?.size <= MAX_FILE_SIZE, "L'image doit faire moins de 5MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Formats acceptés: .jpg, .jpeg, .png"
    )
    .optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: "bdsm" | "jacuzzi" | "gastronomy" | "speed_dating" | "other";
  created_by: string;
  created_at: string;
  updated_at: string;
  location: string | null;
  max_participants: number | null;
  price: number | null;
  is_private: boolean;
  free_for_members: boolean;
  image_url: string | null;
}