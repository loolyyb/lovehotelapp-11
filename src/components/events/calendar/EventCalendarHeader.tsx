import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { EventForm } from '../components/EventForm';
import { EventHeader } from '../components/EventHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from '@/integrations/supabase/types';

type EventType = Database['public']['Enums']['event_type'];

interface EventCalendarHeaderProps {
  selectedEventType: EventType | 'all';
  setSelectedEventType: (value: EventType | 'all') => void;
  isAdmin: boolean;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (value: boolean) => void;
  handleCreateEvent: (values: any) => Promise<void>;
  createEventMutation: {
    isPending: boolean;
  };
}

export function EventCalendarHeader({
  selectedEventType,
  setSelectedEventType,
  isAdmin,
  isCreateModalOpen,
  setIsCreateModalOpen,
  handleCreateEvent,
  createEventMutation,
}: EventCalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <EventHeader />
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Select
          value={selectedEventType}
          onValueChange={(value: EventType | 'all') => setSelectedEventType(value)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Type d'événement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les événements</SelectItem>
            <SelectItem value="bdsm">BDSM</SelectItem>
            <SelectItem value="jacuzzi">Jacuzzi</SelectItem>
            <SelectItem value="gastronomy">Gastronomie</SelectItem>
            <SelectItem value="speed_dating">Speed Dating</SelectItem>
            <SelectItem value="other">Autre</SelectItem>
          </SelectContent>
        </Select>

        {isAdmin && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer un événement
              </Button>
            </DialogTrigger>
            <EventForm 
              onSubmit={handleCreateEvent}
              isLoading={createEventMutation.isPending}
            />
          </Dialog>
        )}
      </div>
    </div>
  );
}