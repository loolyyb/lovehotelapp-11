
import { ProfileStatus } from "../ProfileStatus";
import { WidgetContainer } from "./WidgetContainer";

interface StatusSectionProps {
  status: string | null;
  onUpdate: (value: any) => void;  // Changed from Promise<void> to void
}

export function StatusSection({ status, onUpdate }: StatusSectionProps) {
  return (
    <WidgetContainer title="Statut">
      <ProfileStatus
        status={status}
        onStatusChange={(status) => onUpdate({ status })}
      />
    </WidgetContainer>
  );
}
