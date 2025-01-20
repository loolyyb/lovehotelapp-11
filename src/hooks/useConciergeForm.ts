import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

const formSchema = z.object({
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
        });

      if (dbError) throw dbError;

      // Then, send the email notification
      const { error } = await supabase.functions.invoke('send-concierge-email', {
        body: { 
          formData: values,
          userId: session?.user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Demande envoyée",
        description: "Notre équipe vous contactera dans les plus brefs délais.",
      });

      form.reset();
    } catch (error) {
      console.error('Error sending concierge request:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
}