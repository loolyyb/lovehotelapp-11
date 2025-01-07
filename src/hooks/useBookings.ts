import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "./useAuthSession";
import { ApiService } from "@/services/ApiService";
import { useToast } from "@/hooks/use-toast";

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

export function useBookings() {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const userEmail = session?.user?.email;

  const fetchBookings = async (hotelId: number): Promise<BookingResponse> => {
    if (!userEmail) throw new Error("User email not found");
    
    const endpoint = `/bookings?email=${encodeURIComponent(userEmail)}&order[created]=null&page=1&perPage=1000&cancelled=false&tmp=false`;
    const headers = {
      "Content-Type": "application/ld+json",
      "Accept": "application/ld+json",
      "x-hotel": hotelId.toString(),
    };

    try {
      return await ApiService.get(endpoint, headers);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Impossible de charger vos réservations. Veuillez réessayer.",
      });
      throw error;
    }
  };

  const chateletQuery = useQuery({
    queryKey: ["bookings", "chatelet", userEmail],
    queryFn: () => fetchBookings(1),
    enabled: !!userEmail,
    retry: 1,
  });

  const pigalleQuery = useQuery({
    queryKey: ["bookings", "pigalle", userEmail],
    queryFn: () => fetchBookings(2),
    enabled: !!userEmail,
    retry: 1,
  });

  return {
    chateletBookings: chateletQuery.data,
    pigalleBookings: pigalleQuery.data,
    isLoading: chateletQuery.isLoading || pigalleQuery.isLoading,
    isError: chateletQuery.isError || pigalleQuery.isError,
    error: chateletQuery.error || pigalleQuery.error,
  };
}