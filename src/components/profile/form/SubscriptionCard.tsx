import { WidgetContainer } from "./WidgetContainer";
import { useSubscriptionCard } from "@/hooks/useSubscriptionCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionCardProps {
  membershipType: string;
  memberSince: string;
}

export function SubscriptionCard({ membershipType, memberSince }: SubscriptionCardProps) {
  const { data, isLoading, error } = useSubscriptionCard();

  if (isLoading) {
    return (
      <WidgetContainer title="Carte Abonnement">
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
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
          <div className="mb-4">
            <p className="text-sm font-medium">Type d'abonnement: {membershipType}</p>
            <p className="text-sm text-gray-600">Membre depuis: {memberSince}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-light mb-2">Données de l'API :</p>
            {data ? (
              <pre className="text-xs overflow-auto max-h-60 bg-gray-100 p-4 rounded">
                {JSON.stringify(data, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-gray-500">Aucune donnée disponible</p>
            )}
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
}