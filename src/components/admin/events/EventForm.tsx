import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Event } from "@/types/events";

interface EventFormProps {
  newEvent: Partial<Event>;
  setNewEvent: React.Dispatch<React.SetStateAction<Partial<Event>>>;
  onSubmit: () => void;
  onCancel: () => void;
}

export function EventForm({ newEvent, setNewEvent, onSubmit, onCancel }: EventFormProps) {
  return (
    <Card className="p-4 mb-6 border border-gray-200">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titre</label>
          <Input
            value={newEvent.title || ""}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <Select
            value={newEvent.type}
            onValueChange={(value: Event["type"]) =>
              setNewEvent({ ...newEvent, type: value })
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
              new Date(newEvent.date || new Date()),
              "yyyy-MM-dd'T'HH:mm"
            )}
            onChange={(e) =>
              setNewEvent({
                ...newEvent,
                date: new Date(e.target.value),
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
          <Button onClick={onSubmit} className="w-full">
            Créer l'évènement
          </Button>
        </div>
      </div>
    </Card>
  );
}