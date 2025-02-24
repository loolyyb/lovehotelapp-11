
import { ProfileStatus } from "../ProfileStatus";
import { WidgetContainer } from "./WidgetContainer";

interface StatusSectionProps {
  status: string | null;
  onUpdate: (value: any) => void;
  onChange: (value: any) => void;
}

export function StatusSection({ status, onUpdate, onChange }: StatusSectionProps) {
  return (
    <WidgetContainer title="Statut">
      <ProfileStatus
        status={status}
        onStatusChange={onUpdate}
        onChange={onChange}
      />
    </WidgetContainer>
  );
}
