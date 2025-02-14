
import { Card } from "@/components/ui/card";
import { useBookings } from "@/hooks/useBookings";
import { Loader2 } from "lucide-react";

interface Booking {
  paid: number;
  cards?: any[];
  room?: {
    name: string;
  };
  date: string;
}

interface BookingResponse {
  "hydra:member": Booking[];
}

const BookingsList = ({ bookings }: { bookings: BookingResponse | undefined }) => {
  if (!bookings || !bookings["hydra:member"]) {
    return <p>Aucune réservation à afficher.</p>;
  }

  const filteredBookings = bookings["hydra:member"]
    .filter((booking) => booking.paid > 0 || (booking.cards && booking.cards.length > 0))
    .map((booking) => ({
      nom: booking.room?.name || "Nom indisponible",
      date: booking.date || "Date indisponible",
    }));

  if (filteredBookings.length === 0) {
    return <p>Aucune réservation à afficher.</p>;
  }

  return (
    <ul className="space-y-2">
      {filteredBookings.map((booking, index) => (
        <li key={index} className="flex items-center gap-2">
          <strong className="text-burgundy">{booking.nom}</strong>
          <span className="text-gray-600">-</span>
          <span>{new Date(booking.date).toLocaleDateString("fr-FR")}</span>
        </li>
      ))}
    </ul>
  );
};

export function ReservationsTab() {
  const { chateletBookings, pigalleBookings, isLoading, isError, error } = useBookings();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-4 bg-red-50">
        <p className="text-red-600">
          Une erreur est survenue lors de la récupération de vos réservations: {error?.message}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#40192C] border-[0.5px] border-[#f3ebad]/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <div className="p-4">
          <h3 className="font-semibold text-lg text-white mb-4">Réservations Châtelet</h3>
          <BookingsList bookings={chateletBookings} />
        </div>
      </Card>

      <Card className="bg-[#40192C] border-[0.5px] border-[#f3ebad]/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <div className="p-4">
          <h3 className="font-semibold text-lg text-white mb-4">Réservations Pigalle</h3>
          <BookingsList bookings={pigalleBookings} />
        </div>
      </Card>
    </div>
  );
}
