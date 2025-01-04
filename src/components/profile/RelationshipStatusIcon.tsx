import { Heart } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type RelationshipType = "casual" | "serious" | "libertine" | null;

interface RelationshipStatusIconProps {
  type: RelationshipType;
  className?: string;
}

const getStatusConfig = (type: RelationshipType) => {
  switch (type) {
    case "casual":
      return {
        color: "text-blue-500",
        bgColor: "bg-blue-100",
        label: "Relation sans lendemain"
      };
    case "serious":
      return {
        color: "text-rose-400",
        bgColor: "bg-rose-100",
        label: "Relation sérieuse"
      };
    case "libertine":
      return {
        color: "text-red-600",
        bgColor: "bg-red-100",
        label: "Relation libertine"
      };
    default:
      return {
        color: "text-gray-400",
        bgColor: "bg-gray-100",
        label: "Non spécifié"
      };
  }
};

export function RelationshipStatusIcon({ type, className = "" }: RelationshipStatusIconProps) {
  const config = getStatusConfig(type);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`${config.bgColor} rounded-full p-2 ${className}`}>
            <Heart className={`w-5 h-5 ${config.color} fill-current`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}