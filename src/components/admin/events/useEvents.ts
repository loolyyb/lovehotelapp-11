import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Event, EventType } from "@/types/events";

export function useEvents() {
  const { toast } = useToast();

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ["admin_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      
      return data.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description || "",  // Ensure description is never null
        type: event.event_type as EventType,
        date: new Date(event.event_date),
        location: event.location,
        max_participants: event.max_participants,
        price: event.price,
        created_by: event.created_by,
        created_at: event.created_at,
        updated_at: event.updated_at
      })) as Event[];
    },
  });

  const createEvent = async (eventData: Partial<Event>) => {
    try {
      // Map our frontend type to the database schema
      const dbEventData = {
        title: eventData.title,
        description: eventData.description || "",
        event_type: eventData.type || "other",
        event_date: eventData.date?.toISOString(),
        location: eventData.location,
        max_participants: eventData.max_participants,
        price: eventData.price,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      };

      const { error } = await supabase
        .from("events")
        .insert([dbEventData]);

      if (error) throw error;

      toast({
        title: "Évènement créé",
        description: "L'évènement a été créé avec succès.",
      });
      refetch();
      return true;
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'évènement.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Évènement supprimé",
        description: "L'évènement a été supprimé avec succès.",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'évènement.",
        variant: "destructive",
      });
    }
  };

  return {
    events,
    isLoading,
    createEvent,
    deleteEvent,
  };
}