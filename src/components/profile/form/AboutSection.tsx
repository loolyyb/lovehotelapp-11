
import { ProfileDescription } from "../ProfileDescription";
import { WidgetContainer } from "./WidgetContainer";

interface AboutSectionProps {
  description: string | null;
  onUpdate: (description: string) => void;  // Changed from Promise<void> to void
}

export function AboutSection({ description, onUpdate }: AboutSectionProps) {
  return (
    <WidgetContainer title="À propos de vous">
      <ProfileDescription
        initialDescription={description}
        onSave={onUpdate}
      />
    </WidgetContainer>
  );
}
