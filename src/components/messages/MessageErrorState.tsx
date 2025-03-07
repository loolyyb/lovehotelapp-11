
import React from "react";

interface MessageErrorStateProps {
  retryLoad: () => void;
}

export function MessageErrorState({ retryLoad }: MessageErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[#f3ebad]/70">
      <p className="mb-4">Impossible de charger les messages</p>
      <button 
        onClick={retryLoad} 
        className="px-4 py-2 bg-[#f3ebad]/20 text-[#f3ebad] rounded-md hover:bg-[#f3ebad]/30 transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}
