
import React from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageLoadingStateProps {
  onRefresh?: () => void;
}

export function MessageLoadingState({ onRefresh }: MessageLoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader2 className="h-8 w-8 text-[#f3ebad]/70 animate-spin mb-3" />
      <div className="text-[#f3ebad]/70 text-sm animate-pulse mb-3">Les messages sont en cours de chargement</div>
      {onRefresh && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onRefresh}
          className="text-[#f3ebad]/70 hover:text-[#f3ebad] hover:bg-background/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      )}
    </div>
  );
}
