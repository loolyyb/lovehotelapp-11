import { WidgetContainer } from "./WidgetContainer";

interface LoyaltyPointsSectionProps {
  points: number;
}

export function LoyaltyPointsSection({ points }: LoyaltyPointsSectionProps) {
  return (
    <WidgetContainer title="Points Fidélité">
      <div className="space-y-6">
        <div className="text-lg text-gray-700">
          Vous avez actuellement <span className="font-semibold text-burgundy">{points || 0}</span> points de fidélité
        </div>

        <p className="text-sm text-gray-500">
          Les points de fidélité sont attribués automatiquement lors de vos réservations et peuvent être échangés contre des avantages exclusifs.
        </p>
      </div>
    </WidgetContainer>
  );
}