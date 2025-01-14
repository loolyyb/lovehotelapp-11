import { WidgetContainer } from "./WidgetContainer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";

interface LoyaltyPointsSectionProps {
  points: number;
  cardData?: {
    email?: string;
    secret?: string;
    total?: number;
    usageCount?: number;
    created?: string;
  };
}

export function LoyaltyPointsSection({ points, cardData }: LoyaltyPointsSectionProps) {
  return (
    <WidgetContainer title="Points Fidélité">
      <div className="space-y-6">
        <div className="text-lg text-gray-700">
          Vous avez actuellement <span className="font-semibold text-burgundy">{points || 0}</span> points de fidélité
        </div>
        
        {cardData && (
          <Card className="glass-card overflow-hidden">
            <div className="relative p-6 bg-gradient-to-br from-rose-100 to-champagne">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50 animate-shine"></div>
              
              {/* Card content */}
              <div className="relative space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-cormorant text-2xl font-semibold text-burgundy">
                    Carte de Fidélité
                  </h3>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total: <span className="font-semibold">{cardData.total || 0}</span></p>
                    <p className="text-sm text-gray-600">Utilisations: <span className="font-semibold">{cardData.usageCount || 0}</span></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Email:</span> {cardData.email}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Secret:</span> 
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded ml-1">
                      {cardData.secret}
                    </span>
                  </p>
                  {cardData.created && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Créé le:</span>{" "}
                      {format(new Date(cardData.created), "d MMMM yyyy", { locale: fr })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        <p className="text-sm text-gray-500">
          Les points de fidélité sont attribués automatiquement lors de vos réservations et peuvent être échangés contre des avantages exclusifs.
        </p>
      </div>
    </WidgetContainer>
  );
}