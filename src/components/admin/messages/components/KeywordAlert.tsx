
import { TriangleAlert } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KeywordAlertProps {
  detectedKeywords: string[];
}

export function KeywordAlert({ detectedKeywords }: KeywordAlertProps) {
  if (detectedKeywords.length === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-1 text-amber-500">
            <TriangleAlert className="h-4 w-4" />
            <span className="text-xs font-medium">Alerte</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-black/80 text-amber-300 border-amber-500/50">
          <div>
            <p className="font-semibold mb-1">Mots-clés détectés:</p>
            <ul className="text-xs space-y-1">
              {detectedKeywords.map((keyword, index) => (
                <li key={index}>• {keyword}</li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
