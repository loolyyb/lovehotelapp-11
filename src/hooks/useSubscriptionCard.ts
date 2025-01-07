import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "./useAuthSession";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionCardResponse {
  "@context": string;
  "@id": string;
  "@type": string;
  "hydra:member": any[];
}

export function useSubscriptionCard() {
  const { session, userProfile } = useAuthSession();

  return useQuery({
    queryKey: ["subscription-card", userProfile?.email],
    queryFn: async (): Promise<SubscriptionCardResponse> => {
      if (!session?.access_token || !userProfile?.email) {
        throw new Error("User not authenticated or email not available");
      }

      console.log("Fetching subscription card data for:", userProfile.email);

      const response = await fetch(
        `https://api.lovehotel.io/cards?email=${encodeURIComponent(userProfile.email)}&order[id]=null&page=1&perPage=1000&tmp=false`,
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
        console.error("API Error:", response.status, response.statusText);
        throw new Error("Failed to fetch subscription card data");
      }

      const data = await response.json();
      console.log("API Response:", data);
      return data;
    },
    enabled: !!session?.access_token && !!userProfile?.email,
  });
}