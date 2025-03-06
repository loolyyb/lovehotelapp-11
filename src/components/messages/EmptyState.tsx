
import { RefreshCw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function EmptyState({ onRefresh, isRefreshing = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#f3ebad]/10 flex items-center justify-center">
        <MessageSquare className="w-8 h-8 text-[#f3ebad]/60" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-xl font-medium text-[#f3ebad]">Pas de messages</h3>
        <p className="text-sm text-[#f3ebad]/70">
          Vous n'avez pas encore de conversations actives. Commencez à échanger avec d'autres utilisateurs pour voir vos messages ici.
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
            Actualiser
          </>
        )}
      </Button>
    </div>
  );
}
