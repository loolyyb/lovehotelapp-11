
import { ProfileOrientation } from "../ProfileOrientation";
import { WidgetContainer } from "./WidgetContainer";

interface OrientationSectionProps {
  orientation: string | null;
  onUpdate: (value: any) => void;  // Changed from Promise<void> to void
}

export function OrientationSection({ orientation, onUpdate }: OrientationSectionProps) {
  return (
    <WidgetContainer title="Orientation">
      <ProfileOrientation
        orientation={orientation}
        onOrientationChange={(orientation) => onUpdate({ orientation })}
      />
    </WidgetContainer>
  );
}
