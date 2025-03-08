
import { useLogger } from "@/hooks/useLogger";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  error: string;
  isRefreshingManually: boolean;
  handleRetry: () => void;
}

export function ErrorState({
  error,
  isRefreshingManually,
  handleRetry
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
      <AlertTriangle className="w-12 h-12 text-rose" />
      <h3 className="text-lg font-medium text-[#f3ebad]">Erreur de chargement</h3>
      <p className="text-sm text-[#f3ebad]/70">{error}</p>
      <Button 
        onClick={handleRetry} 
        className="px-4 py-2 text-sm font-medium text-white bg-rose rounded-md hover:bg-rose/90 transition-colors"
        disabled={isRefreshingManually}
      >
        {isRefreshingManually ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Chargement...
          </>
        ) : (
          "Réessayer"
        )}
      </Button>
    </div>
  );
}
