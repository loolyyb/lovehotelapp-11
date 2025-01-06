import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "./useAuthSession";
import { ApiService } from "@/services/ApiService";

interface Booking {
  id: string;
  // Nous ajouterons plus de types une fois que nous aurons analysé la structure complète des données
  [key: string]: any;
}

export function useBookings() {
  const { session } = useAuthSession();
  const userEmail = session?.user?.email;

  const fetchBookings = async (hotelId: number): Promise<Booking[]> => {
    if (!userEmail) throw new Error("User email not found");
    
    const endpoint = `/bookings?email=${encodeURIComponent(userEmail)}&order[created]=null&page=1&perPage=1000&cancelled=false&tmp=false`;
    const headers = {
      "Content-Type": "application/ld+json",
      "Accept": "application/ld+json",
      "x-hotel": hotelId.toString(),
    };

    return ApiService.get(endpoint, headers);
  };

  const chateletQuery = useQuery({
    queryKey: ["bookings", "chatelet", userEmail],
    queryFn: () => fetchBookings(1),
    enabled: !!userEmail,
  });

  const pigalleQuery = useQuery({
    queryKey: ["bookings", "pigalle", userEmail],
    queryFn: () => fetchBookings(2),
    enabled: !!userEmail,
  });

  return {
    chateletBookings: chateletQuery.data,
    pigalleBookings: pigalleQuery.data,
    isLoading: chateletQuery.isLoading || pigalleQuery.isLoading,
    isError: chateletQuery.isError || pigalleQuery.isError,
    error: chateletQuery.error || pigalleQuery.error,
  };
}