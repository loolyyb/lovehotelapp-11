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

      console.log("API Response details:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      const responseText = await response.text();
      console.log("Raw API Response:", responseText);

      if (!response.ok) {
        console.error("API Error:", {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        throw new Error(`Erreur API: ${response.status} - ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed API Response data:", data);
      } catch (error) {
        console.error("Failed to parse API response:", error);
        throw new Error("Réponse API invalide");
      }

      return data;
    },
    enabled: !!session?.access_token && !!userProfile?.email && isAuthenticated && !isAuthLoading,
    retry: 2,
  });
}