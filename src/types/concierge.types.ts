import { z } from "zod";

export const formSchema = z.object({
  experienceType: z.string(),
  customExperience: z.string().optional(),
  decoration: z.boolean().default(false),
  transport: z.boolean().default(false),
  playlist: z.boolean().default(false),
  romanticTable: z.boolean().default(false),
  customMenu: z.boolean().default(false),
  customScenario: z.boolean().default(false),
  accessories: z.string().optional(),
  date: z.date(),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
});

export type ConciergeFormData = z.infer<typeof formSchema>;