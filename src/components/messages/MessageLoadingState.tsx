
import React from "react";

export function MessageLoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-[#f3ebad]/70">Chargement des messages...</div>
    </div>
  );
}
