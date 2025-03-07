
import React from "react";
import { Loader2 } from "lucide-react";

export function MessageLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader2 className="h-8 w-8 text-[#f3ebad]/70 animate-spin mb-3" />
      <div className="text-[#f3ebad]/70 text-sm animate-pulse">Chargement des messages...</div>
    </div>
  );
}
