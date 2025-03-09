
import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectionErrorStateProps {
  errorMessage: string | null;
  isCheckingConnection: boolean;
  onRetry: () => void;
}

export function ConnectionErrorState({ 
  errorMessage, 
  isCheckingConnection, 
  onRetry 
}: ConnectionErrorStateProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#40192C] pt-12 backdrop-blur-sm justify-center items-center">
      <div className="bg-[#40192C]/80 p-8 rounded-lg border border-[#f3ebad]/20 max-w-md text-center">
        <AlertTriangle className="h-12 w-12 text-[#f3ebad]/70 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#f3ebad] mb-2">Problème de connexion</h2>
        <p className="text-[#f3ebad]/70 mb-6">{errorMessage}</p>
        <Button 
          onClick={onRetry}
          className="bg-[#f3ebad] text-[#40192C] hover:bg-[#f3ebad]/90"
          disabled={isCheckingConnection}
        >
          {isCheckingConnection ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Vérification...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
