import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventFormFields } from "./EventFormFields";
import { EventFormValues, eventSchema } from "./types";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EventFormProps {
  onSubmit: (values: EventFormValues) => Promise<void>;
}

export function EventForm({ onSubmit }: EventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      event_date: "",
      start_time: "",
      end_time: "",
      event_type: "other",
      is_private: false,
      price: null,
      free_for_members: true,
    },
  });

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Créer un nouvel événement</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <EventFormFields form={form} />
          <Button type="submit" className="w-full">
            Créer l'événement
          </Button>
        </form>
      </Form>
    </DialogContent>
  );
}