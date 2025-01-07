import { TokensSection } from "../form/TokensSection";
import { LoyaltyPointsSection } from "../form/LoyaltyPointsSection";
import { SubscriptionCard } from "../form/subscription/SubscriptionCard";

interface FidelityTabProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function FidelityTab({ profile, onUpdate }: FidelityTabProps) {
  return (
    <div className="space-y-6 p-6">
      <SubscriptionCard 
        membershipType={profile?.is_love_hotel_member ? "Love Hotel Member" : "Standard"}
        memberSince={new Date(profile?.created_at).getFullYear().toString()}
      />
      <TokensSection tokens={profile?.loolyb_tokens} onUpdate={onUpdate} />
      <LoyaltyPointsSection points={profile?.loyalty_points || 0} />
    </div>
  );
}