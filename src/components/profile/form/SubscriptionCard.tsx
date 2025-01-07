import { WidgetContainer } from "./WidgetContainer";
import { useSubscriptionCard } from "@/hooks/useSubscriptionCard";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SubscriptionCard() {
  const { data, isLoading, error } = useSubscriptionCard();

  if (isLoading) {
    return (
      <WidgetContainer title="Carte Abonnement">
        <div className="text-sm text-gray-500">
          Chargement des données de la carte...
        </div>
      </WidgetContainer>
    );
  }

  if (error) {
    return (
      <WidgetContainer title="Carte Abonnement">
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : "Erreur inconnue"}
          </AlertDescription>
        </Alert>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title="Carte Abonnement">
      <div className="space-y-4">
        <div className="p-4 bg-white/10 rounded-lg">
          <p className="text-sm font-light mb-2">Données de l'API :</p>
          <pre className="text-xs overflow-auto max-h-60 bg-gray-100 p-4 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </WidgetContainer>
  );
}