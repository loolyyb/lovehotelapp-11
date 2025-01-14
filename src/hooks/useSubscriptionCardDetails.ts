import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";

export function useSubscriptionCardDetails(cardId: string | null) {
  return useQuery({
    queryKey: ["subscription-card-details", cardId],
    queryFn: async () => {
      if (!cardId) return null;
      
      const headers = {
        "Content-Type": "application/ld+json",
        "Accept": "application/ld+json",
      };

      try {
        // Remove the base URL from cardId if it's already included
        const cleanCardId = cardId.replace('https://api.lovehotel.io', '');
        return await ApiService.get(cleanCardId, headers);
      } catch (error) {
        console.error('Error fetching subscription card details:', error);
        throw error;
      }
    },
    enabled: !!cardId,
    retry: 1,
  });
}