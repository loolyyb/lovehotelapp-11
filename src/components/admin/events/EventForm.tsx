
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventFormFields } from "./EventFormFields";
import { EventFormValues, eventSchema } from "./types";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface EventFormProps {
  onSubmit: (values: EventFormValues) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<EventFormValues>;
}

export function EventForm({ onSubmit, isLoading, initialData }: EventFormProps) {
  console.log("Initial form data:", initialData);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      event_date: initialData?.event_date || "",
      start_time: initialData?.start_time || "",
      end_time: initialData?.end_time || "",
      event_type: initialData?.event_type || "other",
      is_private: initialData?.is_private || false,
      price: initialData?.price || 0,
      free_for_members: initialData?.free_for_members ?? true,
      image: undefined,
    },
  });

  console.log("Form default values:", form.getValues());

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          {initialData ? "Modifier l'événement" : "Créer un nouvel événement"}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <EventFormFields form={form} />
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Modification en cours..." : "Création de l'événement en cours..."}
              </>
            ) : (
              initialData ? "Modifier l'événement" : "Créer l'événement"
            )}
          </Button>
        </form>
      </Form>
    </DialogContent>
  );
}
