import { useSubscriptionCard } from "@/hooks/useSubscriptionCard";
import { useApiAuth } from "@/hooks/useApiAuth";
import { useAuthSession } from "@/hooks/useAuthSession";
import { SubscriptionCardProps } from "@/types/subscription.types";
import { SubscriptionCardSkeleton } from "./SubscriptionCardSkeleton";
import { SubscriptionCardError } from "./SubscriptionCardError";
import { SubscriptionCardContent } from "./SubscriptionCardContent";

export function SubscriptionCard({ membershipType, memberSince }: SubscriptionCardProps) {
  const { data, isLoading, error } = useSubscriptionCard();
  const { isAuthenticated, isLoading: isAuthLoading } = useApiAuth();
  const { session, userProfile } = useAuthSession();

  const debugInfo = {
    authenticated: isAuthenticated,
    hasSession: !!session,
    hasProfile: !!userProfile,
    userEmail: userProfile?.email
  };

  if (isLoading || isAuthLoading) {
    return <SubscriptionCardSkeleton />;
  }

  if (error) {
    return <SubscriptionCardError error={error} debugInfo={debugInfo} />;
  }

  return (
    <SubscriptionCardContent
      membershipType={membershipType}
      memberSince={memberSince}
      data={data?.data}
      responseDetails={data?.responseDetails}
      debugInfo={debugInfo}
    />
  );
}