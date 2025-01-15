import React from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: "bdsm" | "jacuzzi" | "gastronomy" | "speed_dating" | "other";
  event_date: string;
  max_participants: number | null;
  location: string | null;
  price: number | null;
}

export function EventsManager() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState<Partial<Event>>({
    title: "",
    description: "",
    event_type: "other",
    event_date: new Date().toISOString(),
    max_participants: null,
    location: "",
    price: null,
  });

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

  const createEvent = async () => {
    try {
      const { error } = await supabase.from("events").insert([
        {
          ...newEvent,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Évènement créé",
        description: "L'évènement a été créé avec succès.",
      });
      setIsCreating(false);
      setNewEvent({
        title: "",
        description: "",
        event_type: "other",
        event_date: new Date().toISOString(),
        max_participants: null,
        location: "",
        price: null,
      });
      refetch();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'évènement.",
        variant: "destructive",
      });
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

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gestion des évènements</h2>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Annuler" : "Créer un évènement"}
        </Button>
      </div>

      {isCreating && (
        <Card className="p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <Input
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select
                value={newEvent.event_type}
                onValueChange={(value: Event["event_type"]) =>
                  setNewEvent({ ...newEvent, event_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bdsm">BDSM</SelectItem>
                  <SelectItem value="jacuzzi">Jacuzzi</SelectItem>
                  <SelectItem value="gastronomy">Gastronomie</SelectItem>
                  <SelectItem value="speed_dating">Speed Dating</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={newEvent.description || ""}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                type="datetime-local"
                value={format(
                  new Date(newEvent.event_date || new Date()),
                  "yyyy-MM-dd'T'HH:mm"
                )}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    event_date: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lieu</label>
              <Input
                value={newEvent.location || ""}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre max. de participants
              </label>
              <Input
                type="number"
                value={newEvent.max_participants || ""}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    max_participants: parseInt(e.target.value) || null,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prix (€)</label>
              <Input
                type="number"
                value={newEvent.price || ""}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    price: parseFloat(e.target.value) || null,
                  })
                }
              />
            </div>
            <div className="col-span-2">
              <Button onClick={createEvent} className="w-full">
                Créer l'évènement
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Lieu</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Chargement...
              </TableCell>
            </TableRow>
          ) : events && events.length > 0 ? (
            events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.title}</TableCell>
                <TableCell>
                  <Badge>{event.event_type}</Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(event.event_date), "Pp", { locale: fr })}
                </TableCell>
                <TableCell>{event.location || "Non défini"}</TableCell>
                <TableCell>
                  {event.max_participants
                    ? `Max ${event.max_participants}`
                    : "Illimité"}
                </TableCell>
                <TableCell>
                  {event.price ? `${event.price}€` : "Gratuit"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteEvent(event.id)}
                  >
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Aucun évènement trouvé
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}