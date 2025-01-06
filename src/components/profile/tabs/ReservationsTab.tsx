import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Loader } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ApiService } from "@/services/ApiService";
import { useApiAuth } from "@/hooks/useApiAuth";
import { useToast } from "@/hooks/use-toast";

interface BookingResponse {
  // À compléter avec la structure exacte une fois les données reçues
  [key: string]: any;
}

export function ReservationsTab() {
  const { isAuthenticated } = useApiAuth();
  const { toast } = useToast();

  const fetchBookings = async (hotelId: number): Promise<BookingResponse> => {
    try {
      return await ApiService.get<BookingResponse>(`/bookings`, {
        headers: {
          "x-hotel": hotelId.toString(),
        },
      });
    } catch (error) {
      console.error(`Erreur lors de la récupération des réservations pour l'hôtel ${hotelId}:`, error);
      throw error;
    }
  };

  const { data: chateletBookings, isLoading: isLoadingChatelet } = useQuery({
    queryKey: ["bookings", 1],
    queryFn: () => fetchBookings(1),
    enabled: isAuthenticated,
  });

  const { data: pigalleBookings, isLoading: isLoadingPigalle } = useQuery({
    queryKey: ["bookings", 2],
    queryFn: () => fetchBookings(2),
    enabled: isAuthenticated,
  });

  if (isLoadingChatelet || isLoadingPigalle) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Affichage temporaire des données brutes */}
      <div className="space-y-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-burgundy mb-4">Réservations Châtelet</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-sm">
            {JSON.stringify(chateletBookings, null, 2)}
          </pre>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold text-burgundy mb-4">Réservations Pigalle</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-sm">
            {JSON.stringify(pigalleBookings, null, 2)}
          </pre>
        </Card>
      </div>

      <div className="grid gap-4">
        {reservations.map((reservation, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-pink-100 p-2">
                <CalendarCheck className="h-5 w-5 text-burgundy" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-burgundy">
                  {reservation.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {reservation.date} • {reservation.time}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
