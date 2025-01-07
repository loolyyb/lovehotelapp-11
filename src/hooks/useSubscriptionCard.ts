import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "./useAuthSession";

export function useSubscriptionCard() {
  const { session, userProfile } = useAuthSession();

  return useQuery({
    queryKey: ["subscription-card", userProfile?.email],
    queryFn: async () => {
      if (!session?.access_token || !userProfile?.email) {
        throw new Error("Authentification requise");
      }

      console.log("Récupération des données de la carte pour:", userProfile.email);

      try {
        const response = await fetch(
          `https://api.lovehotel.io/cards?email=${encodeURIComponent(userProfile.email)}`,
          {
            headers: {
              "Content-Type": "application/ld+json",
              "Accept": "application/ld+json",
              "x-hotel": "1",
              "Authorization": `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        console.log("Données reçues:", {
          status: response.status,
          dataLength: data?.["hydra:member"]?.length
        });
        
        return data;
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        throw error;
      }
    },
    enabled: !!session?.access_token && !!userProfile?.email,
  });
}