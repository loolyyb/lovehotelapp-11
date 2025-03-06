
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, MessageSquare } from "lucide-react";

interface EmptyStateProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  isNetworkError?: boolean;
}

export function EmptyState({ onRefresh, isRefreshing, isNetworkError = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {isNetworkError ? (
        <AlertTriangle className="w-16 h-16 mb-4 text-amber-400" />
      ) : (
        <MessageSquare className="w-16 h-16 mb-4 text-[#f3ebad]/60" />
      )}
      
      <h2 className="mb-2 text-xl font-semibold text-[#f3ebad]">
        {isNetworkError 
          ? "Problème de connexion" 
          : "Aucune conversation"}
      </h2>
      
      <p className="mb-6 text-[#f3ebad]/70 max-w-md">
        {isNetworkError
          ? "Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez."
          : "Envoyez un message à un autre utilisateur pour commencer une conversation."}
      </p>
      
      <Button
        onClick={onRefresh}
        className="bg-[#f3ebad] text-[#40192C] hover:bg-[#f3ebad]/90"
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Actualisation...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            {isNetworkError ? "Réessayer" : "Actualiser"}
          </>
        )}
      </Button>
    </div>
  );
}
