import { Heart, Cage } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type RelationshipType = "casual" | "serious" | "libertine" | "bdsm" | null;

interface RelationshipStatusIconProps {
  type: string | RelationshipType;
  className?: string;
}

const getStatusConfig = (type: string | RelationshipType) => {
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
    case "bdsm":
      return {
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        label: "BDSM"
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
  const Icon = type === "bdsm" ? Cage : Heart;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`${config.bgColor} rounded-full p-2 ${className}`}>
            <Icon className={`w-5 h-5 ${config.color} fill-current`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}