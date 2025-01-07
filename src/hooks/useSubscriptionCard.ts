import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "./useAuthSession";
import { useApiAuth } from "./useApiAuth";
import { SubscriptionCardResponse } from "@/types/subscription.types";

export function useSubscriptionCard() {
  const { session, userProfile } = useAuthSession();
  const { isAuthenticated, isLoading: isAuthLoading } = useApiAuth();

  console.log("useSubscriptionCard - Auth State:", {
    hasSession: !!session,
    hasUserProfile: !!userProfile,
    userEmail: userProfile?.email,
    isAuthenticated,
    isAuthLoading
  });

  return useQuery<SubscriptionCardResponse, Error>({
    queryKey: ["subscription-card", userProfile?.email],
    queryFn: async () => {
      if (!session?.access_token || !userProfile?.email) {
        throw new Error("Authentification requise");
      }

      if (!isAuthenticated) {
        throw new Error("API non authentifiée");
      }

      const apiUrl = `https://api.lovehotel.io/cards?email=${encodeURIComponent(userProfile.email)}&order[id]=DESC`;
      const response = await fetch(apiUrl, {
        headers: {
          "Content-Type": "application/ld+json",
          "Accept": "application/ld+json",
          "x-hotel": "1",
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      const responseDetails = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      };

      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} - ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        throw new Error("Réponse API invalide");
      }

      return { data, responseDetails };
    },
    enabled: !!session?.access_token && !!userProfile?.email && isAuthenticated && !isAuthLoading,
    retry: 2,
  });
}