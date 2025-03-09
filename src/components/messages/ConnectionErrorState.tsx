
import React from "react";
import { Button } from "@/components/ui/button";
import { WifiOff, RotateCw } from "lucide-react";

interface ConnectionErrorStateProps {
  onRetry: () => void;
  isRetrying: boolean;
}

export function ConnectionErrorState({ onRetry, isRetrying }: ConnectionErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-[#40192C]/20 border border-dashed border-[#f3ebad]/20 rounded-lg">
      <WifiOff className="w-16 h-16 mb-4 text-[#f3ebad]/50" />
      <h3 className="text-xl font-semibold text-[#f3ebad] mb-2">
        Problème de connexion
      </h3>
      <p className="text-[#f3ebad]/70 mb-6 max-w-md">
        Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez.
      </p>
      <Button 
        onClick={onRetry}
        disabled={isRetrying}
        className="flex items-center gap-2 bg-[#CD0067] hover:bg-[#CD0067]/90 text-white"
      >
        {isRetrying ? (
          <>
            <RotateCw className="w-4 h-4 animate-spin" />
            Tentative de reconnexion...
          </>
        ) : (
          <>
            <RotateCw className="w-4 h-4" />
            Réessayer
          </>
        )}
      </Button>
    </div>
  );
}
