
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
    if (!userEmail) {
      console.error('No user email found in session');
      throw new Error("User email not found");
    }
    
    const endpoint = `/bookings?email=${encodeURIComponent(userEmail)}&order[created]=null&page=1&perPage=1000&cancelled=false&tmp=false`;
    const headers = {
      "Content-Type": "application/ld+json",
      "Accept": "application/ld+json",
      "x-hotel": hotelId.toString(),
    };

    try {
      console.log(`Fetching bookings for hotel ${hotelId}...`);
      console.log('Headers:', headers);
      console.log('Endpoint:', endpoint);
      
      const token = await ApiService.getHeaders(headers);
      console.log('Auth token present:', !!token.get('Authorization'));
      
      const response = await ApiService.get(endpoint, headers);
      console.log(`Successfully fetched bookings for hotel ${hotelId}:`, response);
      return response;
    } catch (error: any) {
      console.error(`Error fetching bookings for hotel ${hotelId}:`, error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
      });
      
      let errorMessage = "Impossible de charger vos réservations. ";
      
      if (error.status === 401) {
        errorMessage += "Problème d'authentification. Veuillez vous reconnecter.";
      } else if (error.status === 403) {
        errorMessage += "Accès non autorisé.";
      } else if (error.status === 404) {
        errorMessage += "Service temporairement indisponible.";
      } else {
        errorMessage += "Veuillez réessayer plus tard.";
      }
      
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: errorMessage,
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
