import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

const formSchema = z.object({
  experienceType: z.string().min(1, "Le type d'expérience est requis"),
  customExperience: z.string().optional(),
  decoration: z.boolean().default(false),
  transport: z.boolean().default(false),
  playlist: z.boolean().default(false),
  romanticTable: z.boolean().default(false),
  customMenu: z.boolean().default(false),
  customScenario: z.boolean().default(false),
  accessories: z.string().optional(),
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
    .optional()
    .refine((val) => !val || /^(\+33|0)[1-9](\d{8}|\d{2}\s\d{2}\s\d{2}\s\d{2})$/.test(val), {
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
      decoration: false,
      transport: false,
      playlist: false,
      romanticTable: false,
      customMenu: false,
      customScenario: false,
    },
  });

  const onSubmit = async (values: ConciergeFormData) => {
    try {
      console.log("Starting form submission with values:", values);

      // First, store the request in the database
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

      // Then, send the email notification
      const { error } = await supabase.functions.invoke('send-concierge-email', {
        body: { 
          formData: {
            ...values,
            date: values.date.toISOString()
          },
          userId: session?.user?.id
        }
      });

      if (error) {
        console.error("Email function error:", error);
        throw error;
      }

      console.log("Successfully sent email notification");

      toast({
        title: "Demande envoyée",
        description: "Notre équipe vous contactera dans les plus brefs délais.",
      });

      form.reset();
    } catch (error: any) {
      console.error('Error sending concierge request:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
}