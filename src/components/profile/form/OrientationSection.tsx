import { ProfileOrientation } from "../ProfileOrientation";
import { WidgetContainer } from "./WidgetContainer";

interface OrientationSectionProps {
  orientation: string | null;
  onUpdate: (updates: any) => Promise<void>;
}

export function OrientationSection({ orientation, onUpdate }: OrientationSectionProps) {
  return (
    <WidgetContainer title="Orientation">
      <ProfileOrientation
        orientation={orientation}
        onOrientationChange={(orientation) => onUpdate({ sexual_orientation: orientation })}
      />
    </WidgetContainer>
  );
}