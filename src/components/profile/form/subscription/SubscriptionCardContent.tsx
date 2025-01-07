import { WidgetContainer } from "../WidgetContainer";
import { ResponseDetails } from "@/types/subscription.types";

interface SubscriptionCardContentProps {
  membershipType: string;
  memberSince: string;
  data: any;
  responseDetails: ResponseDetails;
  debugInfo: {
    authenticated: boolean;
    hasSession: boolean;
    hasProfile: boolean;
    userEmail: string | undefined;
  };
}

export function SubscriptionCardContent({
  membershipType,
  memberSince,
  data,
  responseDetails,
  debugInfo
}: SubscriptionCardContentProps) {
  return (
    <WidgetContainer title="Carte Abonnement">
      <div className="space-y-4">
        <div className="p-4 bg-white/10 rounded-lg">
          <div className="mb-4">
            <p className="text-sm font-medium">Type d'abonnement: {membershipType}</p>
            <p className="text-sm text-gray-600">Membre depuis: {memberSince}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-light mb-2">Détails de la réponse HTTP:</p>
            <pre className="text-xs overflow-auto max-h-60 bg-gray-100 p-4 rounded">
              {JSON.stringify(responseDetails, null, 2)}
            </pre>

            <p className="text-sm font-light mb-2">État de la connexion:</p>
            <pre className="text-xs overflow-auto max-h-60 bg-gray-100 p-4 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
            
            <p className="text-sm font-light mb-2">Réponse brute de l'API :</p>
            <pre className="text-xs overflow-auto max-h-60 bg-gray-100 p-4 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
}