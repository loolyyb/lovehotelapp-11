import { Alert, AlertDescription } from "@/components/ui/alert";
import { WidgetContainer } from "../WidgetContainer";

interface SubscriptionCardErrorProps {
  error: Error;
  debugInfo: {
    authenticated: boolean;
    hasSession: boolean;
    hasProfile: boolean;
    userEmail: string | undefined;
  };
}

export function SubscriptionCardError({ error, debugInfo }: SubscriptionCardErrorProps) {
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
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </WidgetContainer>
  );
}