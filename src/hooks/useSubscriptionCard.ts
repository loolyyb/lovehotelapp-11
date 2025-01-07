import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "./useAuthSession";
import { useApiAuth } from "./useApiAuth";

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

  return useQuery({
    queryKey: ["subscription-card", userProfile?.email],
    queryFn: async () => {
      console.log("Starting API call with:", {
        accessToken: session?.access_token ? "Present" : "Missing",
        userEmail: userProfile?.email,
        isAuthenticated
      });

      if (!session?.access_token || !userProfile?.email) {
        console.log("Missing required data:", {
          hasAccessToken: !!session?.access_token,
          hasUserEmail: !!userProfile?.email
        });
        throw new Error("Authentification requise");
      }

      if (!isAuthenticated) {
        console.log("API not authenticated yet");
        throw new Error("API non authentifiée");
      }

      const apiUrl = `https://api.lovehotel.io/cards?email=${encodeURIComponent(userProfile.email)}&order[id]=DESC`;
      console.log("Calling API:", apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          "Content-Type": "application/ld+json",
          "Accept": "application/ld+json",
          "x-hotel": "1",
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      console.log("API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Erreur API: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response data:", data);
      return data;
    },
    enabled: !!session?.access_token && !!userProfile?.email && isAuthenticated && !isAuthLoading,
    retry: 2,
  });
}