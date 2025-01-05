import { ProfileStatus } from "../ProfileStatus";
import { WidgetContainer } from "./WidgetContainer";

interface StatusSectionProps {
  status: string | null;
  onUpdate: (updates: any) => Promise<void>;
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