
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventType } from "@/types/events";

interface EventCardProps {
  id: string;
  title: string;
  type: EventType;
  description: string;
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
  onParticipate: (eventId: string) => void;
  isParticipating: boolean;
}

const getEventTypeColor = (type: EventType) => {
  switch (type) {
    case "bdsm":
      return "bg-burgundy-600 hover:bg-burgundy-700";
    case "jacuzzi":
      return "bg-blue-600 hover:bg-blue-700";
    case "gastronomy":
      return "bg-rose-600 hover:bg-rose-700";
    case "speed_dating":
      return "bg-pink-600 hover:bg-pink-700";
    default:
      return "bg-gray-600 hover:bg-gray-700";
  }
};

export const EventCard = ({
  id,
  title,
  type,
  description,
  imageUrl,
  startTime,
  endTime,
  onParticipate,
  isParticipating
}: EventCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-lg bg-white shadow-md"
    >
      {imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-xl font-cormorant font-semibold text-[#ce0067]">
            {title}
          </h3>
          {startTime && endTime && (
            <p className="text-sm mt-1 text-zinc-950">
              {startTime} - {endTime}
            </p>
          )}
        </div>
        <Badge className={getEventTypeColor(type)}>
          {type.replace('_', ' ')}
        </Badge>
      </div>
      <p className="font-montserrat text-sm mb-4 text-zinc-700">{description}</p>
      <Button
        onClick={() => onParticipate(id)}
        className={`w-full ${
          isParticipating
            ? "bg-gray-500 hover:bg-gray-600"
            : "bg-burgundy hover:bg-burgundy-600 text-white bg-[#ce0067]"
        }`}
      >
        {isParticipating ? "Ne plus participer" : "Participer"}
      </Button>
    </motion.div>
  );
};
