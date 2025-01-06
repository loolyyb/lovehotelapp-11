import { Card } from "@/components/ui/card";
import { useBookings } from "@/hooks/useBookings";
import { Loader2 } from "lucide-react";

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
      <Card className="p-4">
        <h3 className="font-semibold text-lg text-burgundy mb-4">Réservations Châtelet</h3>
        <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
          {JSON.stringify(chateletBookings, null, 2)}
        </pre>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-lg text-burgundy mb-4">Réservations Pigalle</h3>
        <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
          {JSON.stringify(pigalleBookings, null, 2)}
        </pre>
      </Card>
    </div>
  );
}