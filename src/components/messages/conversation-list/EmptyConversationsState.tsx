
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus } from "lucide-react";

interface EmptyConversationsStateProps {
  isRefreshingManually: boolean;
  handleRetry: () => void;
}

export function EmptyConversationsState({
  isRefreshingManually,
  handleRetry
}: EmptyConversationsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#f3ebad]/10 flex items-center justify-center">
        <UserPlus className="w-8 h-8 text-[#f3ebad]/70" />
      </div>
      <h3 className="text-lg font-medium text-[#f3ebad]">Aucune conversation</h3>
      <p className="text-sm text-[#f3ebad]/70 max-w-sm">
        Vous n'avez pas encore de conversations. Explorez les profils pour commencer une discussion.
      </p>
      <div className="flex space-x-3">
        <Button 
          onClick={handleRetry} 
          variant="outline"
          className="border-[#f3ebad]/30 text-[#f3ebad] hover:bg-[#f3ebad]/10"
          disabled={isRefreshingManually}
        >
          {isRefreshingManually ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Actualisation...
            </>
          ) : (
            "Actualiser"
          )}
        </Button>
      </div>
    </div>
  );
}
