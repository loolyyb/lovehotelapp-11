
import { ProfileOrientation } from "../ProfileOrientation";
import { WidgetContainer } from "./WidgetContainer";

interface OrientationSectionProps {
  orientation: string | null;
  onUpdate: (value: any) => void;  
  onChange: (value: any) => void;  // Add onChange prop to match the pattern
}

export function OrientationSection({ orientation, onUpdate, onChange }: OrientationSectionProps) {
  return (
    <WidgetContainer title="Orientation">
      <ProfileOrientation
        orientation={orientation}
        onOrientationChange={onUpdate}
        onChange={onChange}
      />
    </WidgetContainer>
  );
}
