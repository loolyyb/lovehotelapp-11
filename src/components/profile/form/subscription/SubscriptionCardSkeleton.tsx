import { WidgetContainer } from "../WidgetContainer";
import { Skeleton } from "@/components/ui/skeleton";

export function SubscriptionCardSkeleton() {
  return (
    <WidgetContainer title="Carte Abonnement">
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    </WidgetContainer>
  );
}