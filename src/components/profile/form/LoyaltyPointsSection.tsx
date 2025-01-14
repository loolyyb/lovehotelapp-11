import { WidgetContainer } from "./WidgetContainer";
import { useBookings } from "@/hooks/useBookings";

interface LoyaltyPointsSectionProps {
  points: number;
}

export function LoyaltyPointsSection({ points }: LoyaltyPointsSectionProps) {
  const { chateletBookings, pigalleBookings } = useBookings();

  const filterValidBookings = (bookings: any) => {
    if (!bookings || !bookings["hydra:member"]) return 0;
    return bookings["hydra:member"].filter(
      (booking: any) => booking.paid > 0 || (booking.cards && booking.cards.length > 0)
    ).length;
  };

  const totalBookings = filterValidBookings(chateletBookings) + filterValidBookings(pigalleBookings);
  
  const bookingsUntilBonus = Math.max(0, 10 - totalBookings);

  return (
    <WidgetContainer title="Points Fidélité">
      <div className="space-y-6">
        <div className="text-lg text-gray-700">
          Vous avez actuellement <span className="font-semibold text-burgundy">{totalBookings}</span> points de fidélité
        </div>

        <p className="text-sm text-gray-500">
          Les points de fidélité sont attribués automatiquement lors de vos réservations et peuvent être échangés contre des avantages exclusifs.
        </p>

        <p className="text-sm font-medium text-burgundy">
          Plus que {bookingsUntilBonus} réservations avant votre prochain bonus !
        </p>
      </div>
    </WidgetContainer>
  );
}