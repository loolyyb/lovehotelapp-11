import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

const formSchema = z.object({
  experienceType: z.string().min(1, "Le type d'expérience est requis"),
  customExperience: z.string(),
  decoration: z.boolean(),
  transport: z.boolean(),
  playlist: z.boolean(),
  romanticTable: z.boolean(),
  customMenu: z.boolean(),
  customScenario: z.boolean(),
  accessories: z.string(),
  date: z.date({
    required_error: "La date est requise",
    invalid_type_error: "Format de date invalide",
  }).refine((date) => {
    const now = new Date();
    return date > now;
  }, "La date doit être dans le futur"),
  description: z.string()
    .min(10, "La description doit faire au moins 10 caractères")
    .max(1000, "La description ne doit pas dépasser 1000 caractères"),
  firstName: z.string()
    .min(2, "Le prénom doit faire au moins 2 caractères")
    .max(50, "Le prénom ne doit pas dépasser 50 caractères"),
  lastName: z.string()
    .min(2, "Le nom doit faire au moins 2 caractères")
    .max(50, "Le nom ne doit pas dépasser 50 caractères"),
  email: z.string()
    .email("Format d'email invalide")
    .min(5, "L'email doit faire au moins 5 caractères")
    .max(100, "L'email ne doit pas dépasser 100 caractères"),
  phone: z.string()
    .min(1, "Le numéro de téléphone est requis")
    .refine((val) => /^(\+33|0)[1-9](\d{8}|\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{2})$/.test(val), {
      message: "Format de téléphone invalide (format français uniquement)",
    }),
});

export type ConciergeFormData = z.infer<typeof formSchema>;

export function useConciergeForm() {
  const { toast } = useToast();
  const { session } = useAuthSession();

  const form = useForm<ConciergeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      experienceType: "",
      customExperience: "",
      decoration: false,
      transport: false,
      playlist: false,
      romanticTable: false,
      customMenu: false,
      customScenario: false,
      accessories: "",
      date: new Date(Date.now() + 86400000),
      description: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (values: ConciergeFormData) => {
    try {
      console.log("Starting form submission with values:", values);

      const { error: dbError } = await supabase
        .from('concierge_requests')
        .insert({
          user_id: session?.user?.id,
          experience_type: values.experienceType,
          custom_experience: values.customExperience,
          decoration: values.decoration,
          transport: values.transport,
          playlist: values.playlist,
          romantic_table: values.romanticTable,
          custom_menu: values.customMenu,
          custom_scenario: values.customScenario,
          accessories: values.accessories,
          event_date: values.date.toISOString(),
          description: values.description,
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone: values.phone,
          status: 'pending'
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      console.log("Successfully stored request in database");

      toast({
        title: "Demande envoyée avec succès",
        description: "Notre équipe de conciergerie va étudier votre demande et vous recontacter dans les plus brefs délais.",
        variant: "default",
      });

      form.reset();
    } catch (error: any) {
      console.error('Error sending concierge request:', error);
      toast({
        title: "Erreur lors de l'envoi",
        description: "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer ou nous contacter directement.",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
}