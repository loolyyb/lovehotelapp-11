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

      console.log("Appel API pour:", userProfile.email);

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
      console.log("Données reçues:", data);
      return data;
    },
    enabled: !!session?.access_token && !!userProfile?.email,
  });
}