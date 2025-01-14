import { TokensSection } from "../form/TokensSection";
import { LoyaltyPointsSection } from "../form/LoyaltyPointsSection";
import { SubscriptionSection } from "../form/SubscriptionSection";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";
import { useAuthSession } from "@/hooks/useAuthSession";

interface FidelityTabProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function FidelityTab({ profile, onUpdate }: FidelityTabProps) {
  const { session } = useAuthSession();
  const userEmail = session?.user?.email;

  const { data: cardData } = useQuery({
    queryKey: ["loyalty-card", userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const response = await ApiService.get(`/cards?email=${encodeURIComponent(userEmail)}&order[id]=&page=1&perPage=1000&temp=false`);
      return response["hydra:member"]?.[0] || null;
    },
    enabled: !!userEmail,
  });

  return (
    <div className="space-y-6 p-6">
      <LoyaltyPointsSection 
        points={profile?.loyalty_points || 0} 
        cardData={cardData}
      />
      <SubscriptionSection />
      <TokensSection tokens={profile?.loolyb_tokens} onUpdate={onUpdate} />
    </div>
  );
}