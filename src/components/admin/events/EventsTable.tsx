
import React from "react";
import { Shield, Globe, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Event } from "./types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EventsTableProps {
  events?: Event[];
}

export function EventsTable({ events }: EventsTableProps) {
  const { data: participants } = useQuery({
    queryKey: ['event-participants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_participants_with_profiles')
        .select('*')
        .order('registered_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const getParticipantsForEvent = (eventId: string) => {
    return participants?.filter(p => p.event_id === eventId) || [];
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Prix</TableHead>
          <TableHead>Participants</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events?.map((event) => {
          const eventParticipants = getParticipantsForEvent(event.id);
          
          return (
            <TableRow key={event.id}>
              <TableCell className="flex items-center gap-2">
                {event.is_private ? (
                  <Shield className="h-4 w-4 text-gray-500" />
                ) : (
                  <Globe className="h-4 w-4 text-gray-500" />
                )}
                {event.title}
              </TableCell>
              <TableCell>
                {new Date(event.event_date).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell>{event.event_type}</TableCell>
              <TableCell>
                {event.is_private ? "Privé" : "Public"}
              </TableCell>
              <TableCell>
                {event.free_for_members 
                  ? "Gratuit pour les membres" 
                  : `${event.price || 0}€`}
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {eventParticipants.slice(0, 3).map((participant) => (
                            <Avatar key={participant.participation_id} className="w-8 h-8 border-2 border-white">
                              <AvatarImage src={participant.avatar_url} />
                              <AvatarFallback>{participant.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {eventParticipants.length} 
                          <Users className="inline ml-1 h-4 w-4" />
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2">
                        {eventParticipants.map((participant) => (
                          <div key={participant.participation_id} className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={participant.avatar_url} />
                              <AvatarFallback>{participant.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span>{participant.full_name}</span>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
