import { Card } from "@/components/ui/card";
import { useSubscriptionCards } from "@/hooks/useSubscriptionCards";
import { useSubscriptionCardDetails } from "@/hooks/useSubscriptionCardDetails";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { WidgetContainer } from "./WidgetContainer";

export function SubscriptionSection() {
  const { data: cards, isLoading, isError } = useSubscriptionCards();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const { data: cardDetails, isLoading: isLoadingDetails } = useSubscriptionCardDetails(selectedCardId);

  if (isLoading) {
    return (
      <WidgetContainer title="Abonnement">
        <div className="flex justify-center items-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
        </div>
      </WidgetContainer>
    );
  }

  if (isError) {
    return (
      <WidgetContainer title="Abonnement">
        <Card className="p-4 bg-red-50">
          <p className="text-red-600">
            Une erreur est survenue lors de la récupération de vos abonnements
          </p>
        </Card>
      </WidgetContainer>
    );
  }

  if (!cards || !cards["hydra:member"] || cards["hydra:member"].length === 0) {
    return (
      <WidgetContainer title="Abonnement">
        <p className="text-gray-500">Aucun abonnement actif</p>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title="Abonnement">
      <div className="space-y-4">
        {cards["hydra:member"].map((card) => (
          <Card key={card.id} className="p-4 space-y-4">
            <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-2 rounded">
              {JSON.stringify(card, null, 2)}
            </pre>
            
            {card["@id"] && (
              <>
                <button
                  onClick={() => setSelectedCardId(card["@id"])}
                  className="text-sm text-burgundy hover:underline"
                >
                  Voir les détails
                </button>
                
                {selectedCardId === card["@id"] && (
                  <div className="mt-2">
                    {isLoadingDetails ? (
                      <Loader2 className="h-4 w-4 animate-spin text-burgundy" />
                    ) : cardDetails ? (
                      <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-2 rounded">
                        {JSON.stringify(cardDetails, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                )}
              </>
            )}
          </Card>
        ))}
      </div>
    </WidgetContainer>
  );
}