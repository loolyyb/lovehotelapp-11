import { Card } from "@/components/ui/card";
import { useSubscriptionCards } from "@/hooks/useSubscriptionCards";
import { Loader2 } from "lucide-react";
import { WidgetContainer } from "./WidgetContainer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
export function SubscriptionSection() {
  const {
    data: cards,
    isLoading,
    isError
  } = useSubscriptionCards();
  if (isLoading) {
    return <WidgetContainer title="Abonnement">
        <div className="flex justify-center items-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
        </div>
      </WidgetContainer>;
  }
  if (isError) {
    return <WidgetContainer title="Abonnement">
        <Card className="p-4 bg-red-50">
          <p className="text-red-600">
            Une erreur est survenue lors de la récupération de vos abonnements
          </p>
        </Card>
      </WidgetContainer>;
  }
  if (!cards || !cards["hydra:member"] || cards["hydra:member"].length === 0) {
    return <WidgetContainer title="Abonnement">
        <p className="text-gray-200">Aucun abonnement actif</p>
      </WidgetContainer>;
  }
  return <WidgetContainer title="Abonnement">
      <div className="space-y-4">
        {cards["hydra:member"].map(card => <Card key={card.id} className="glass-card overflow-hidden">
            <div className="relative p-6 bg-gradient-to-br from-rose-100 to-champagne">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50 animate-shine rounded-lg bg-accent-300 hover:bg-accent-200"></div>
              
              {/* Card content */}
              <div className="relative space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-cormorant text-2xl font-semibold text-rose-500">
                    Carte de Fidélité
                  </h3>
                  <div className="text-right">
                    <p className="text-sm text-gray-800">Total: <span className="font-semibold">{card.total || 0}</span></p>
                    <p className="text-sm text-gray-800">Utilisations: <span className="font-semibold">{card.usageCount || 0}</span></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Email:</span> {card.email}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Secret:</span> 
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded ml-1">
                      {card.secret}
                    </span>
                  </p>
                  {card.created && <p className="text-sm text-gray-800">
                      <span className="font-medium">Créé le:</span>{" "}
                      {format(new Date(card.created), "d MMMM yyyy", {
                  locale: fr
                })}
                    </p>}
                </div>
              </div>
            </div>
          </Card>)}
      </div>
    </WidgetContainer>;
}