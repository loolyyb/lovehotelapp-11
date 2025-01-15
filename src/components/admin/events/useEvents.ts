import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/events";

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
      return data as Event[];
    },
  });

  const createEvent = async (eventData: Partial<Event>) => {
    try {
      const { error } = await supabase.from("events").insert([
        {
          ...eventData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        },
      ]);

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
      const { error } = await supabase.from("events").delete().eq("id", eventId);

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