import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "./useAuthSession";
import { ApiService } from "@/services/ApiService";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionCard {
  id: number;
  name: string;
  status: string;
  expiration_date?: string;
  remaining_entries?: number;
}

interface CardsResponse {
  "hydra:member": SubscriptionCard[];
}

export function useSubscriptionCards() {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const userEmail = session?.user?.email;

  const fetchCards = async (): Promise<CardsResponse> => {
    if (!userEmail) throw new Error("User email not found");
    
    const endpoint = `/cards?email=${encodeURIComponent(userEmail)}&order[id]=&page=1&perPage=1000&temp=false`;
    const headers = {
      "Content-Type": "application/ld+json",
      "Accept": "application/ld+json",
    };

    try {
      return await ApiService.get(endpoint, headers);
    } catch (error) {
      console.error('Error fetching subscription cards:', error);
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Impossible de charger vos cartes d'abonnement. Veuillez réessayer.",
      });
      throw error;
    }
  };

  return useQuery({
    queryKey: ["subscription-cards", userEmail],
    queryFn: fetchCards,
    enabled: !!userEmail,
    retry: 1,
  });
}