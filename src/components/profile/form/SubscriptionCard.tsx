import { WidgetContainer } from "./WidgetContainer";
import { useSubscriptionCard } from "@/hooks/useSubscriptionCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiAuth } from "@/hooks/useApiAuth";
import { useAuthSession } from "@/hooks/useAuthSession";

interface SubscriptionCardProps {
  membershipType: string;
  memberSince: string;
}

export function SubscriptionCard({ membershipType, memberSince }: SubscriptionCardProps) {
  const { data, isLoading, error } = useSubscriptionCard();
  const { isAuthenticated, isLoading: isAuthLoading } = useApiAuth();
  const { session, userProfile } = useAuthSession();

  console.log("SubscriptionCard Component State:", {
    isLoading,
    isAuthLoading,
    hasError: !!error,
    hasData: !!data,
    isAuthenticated,
    hasSession: !!session,
    hasUserProfile: !!userProfile
  });

  if (isLoading || isAuthLoading) {
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
        <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
          <p>État de la connexion:</p>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify({
              authenticated: isAuthenticated,
              hasSession: !!session,
              hasProfile: !!userProfile,
              userEmail: userProfile?.email
            }, null, 2)}
          </pre>
        </div>
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
            <p className="text-sm font-light mb-2">État de la connexion:</p>
            <pre className="text-xs overflow-auto max-h-60 bg-gray-100 p-4 rounded">
              {JSON.stringify({
                authenticated: isAuthenticated,
                hasSession: !!session,
                hasProfile: !!userProfile,
                userEmail: userProfile?.email
              }, null, 2)}
            </pre>
            
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