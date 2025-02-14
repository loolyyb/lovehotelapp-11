
import React from "react";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Participant {
  participation_id: string;
  avatar_url?: string;
  full_name?: string;
}

interface ParticipantsThumbnailsProps {
  participants: Participant[];
}

export function ParticipantsThumbnails({ participants }: ParticipantsThumbnailsProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {participants.slice(0, 3).map((participant) => (
                <Avatar key={participant.participation_id} className="w-8 h-8 border-2 border-white">
                  <AvatarImage src={participant.avatar_url} />
                  <AvatarFallback>{participant.full_name?.[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {participants.length}
              <Users className="inline ml-1 h-4 w-4" />
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2">
            {participants.map((participant) => (
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
  );
}
