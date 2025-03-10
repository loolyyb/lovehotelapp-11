
import { Button } from "@/components/ui/button";
import { CircleXIcon, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  error: string | null;
  isRefreshingManually: boolean;
  handleRetry: () => void;
}

export function ErrorState({ error, isRefreshingManually, handleRetry }: ErrorStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center space-y-4">
      <CircleXIcon className="h-12 w-12 text-red-500" />
      <h3 className="text-xl font-semibold">Erreur de chargement</h3>
      <p className="text-muted-foreground max-w-sm">
        {error || "Nous n'avons pas pu charger vos conversations. Veuillez réessayer."}
      </p>
      <Button 
        variant="default" 
        onClick={handleRetry}
        disabled={isRefreshingManually}
        className="gap-2"
      >
        {isRefreshingManually ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Chargement...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </>
        )}
      </Button>
    </div>
  );
}
