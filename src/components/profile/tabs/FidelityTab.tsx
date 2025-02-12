import { TokensSection } from "../form/TokensSection";
import { LoyaltyPointsSection } from "../form/LoyaltyPointsSection";
import { SubscriptionSection } from "../form/SubscriptionSection";
interface FidelityTabProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}
export function FidelityTab({
  profile,
  onUpdate
}: FidelityTabProps) {
  return <div className="space-y-1 p-0">
      <LoyaltyPointsSection points={profile?.loyalty_points || 0} />
      <SubscriptionSection />
      <TokensSection tokens={profile?.loolyb_tokens} onUpdate={onUpdate} />
    </div>;
}