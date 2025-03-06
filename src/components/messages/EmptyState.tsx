
import { RefreshCw, MessageSquare, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  isNetworkError?: boolean;
}

export function EmptyState({ 
  onRefresh, 
  isRefreshing = false, 
  isNetworkError = false 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#f3ebad]/10 flex items-center justify-center">
        {isNetworkError ? (
          <WifiOff className="w-8 h-8 text-[#f3ebad]/60" />
        ) : (
          <MessageSquare className="w-8 h-8 text-[#f3ebad]/60" />
        )}
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-xl font-medium text-[#f3ebad]">
          {isNetworkError ? "Problème de connexion" : "Pas de messages"}
        </h3>
        <p className="text-sm text-[#f3ebad]/70">
          {isNetworkError 
            ? "Impossible de charger vos conversations. Vérifiez votre connexion internet ou essayez de vous reconnecter."
            : "Vous n'avez pas encore de conversations actives. Commencez à échanger avec d'autres utilisateurs pour voir vos messages ici."}
        </p>
      </div>
      <Button 
        onClick={onRefresh}
        className="px-4 py-2 text-sm font-medium text-burgundy bg-[#f3ebad] rounded-md hover:bg-[#f3ebad]/90 transition-colors"
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
