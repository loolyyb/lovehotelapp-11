import { TokensSection } from "../form/TokensSection";
import { LoyaltyPointsSection } from "../form/LoyaltyPointsSection";

interface FidelityTabProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function FidelityTab({ profile, onUpdate }: FidelityTabProps) {
  return (
    <div className="space-y-6 p-6">
      <TokensSection tokens={profile?.loolyb_tokens} onUpdate={onUpdate} />
      <LoyaltyPointsSection points={profile?.loyalty_points || 0} />
    </div>
  );
}