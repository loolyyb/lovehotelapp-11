
import { MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function EmptyState({ onRefresh, isRefreshing = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#f3ebad]/10 flex items-center justify-center">
        <MessageSquare className="w-8 h-8 text-[#f3ebad]/70" />
      </div>
      <h3 className="text-lg font-medium text-[#f3ebad]">Pas de messages</h3>
      <p className="text-sm text-[#f3ebad]/70 max-w-sm">
        Cette conversation ne contient pas encore de messages. 
        Envoyez un message pour démarrer la conversation.
      </p>
      <Button 
        onClick={onRefresh} 
        className="mt-4 text-[#40192C] bg-[#f3ebad] hover:bg-[#f3ebad]/90"
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Chargement...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Rafraîchir
          </>
        )}
      </Button>
    </div>
  );
}
