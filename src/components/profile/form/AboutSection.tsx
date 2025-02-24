
import { ProfileDescription } from "../ProfileDescription";
import { WidgetContainer } from "./WidgetContainer";

interface AboutSectionProps {
  description: string | null;
  onUpdate: (description: string) => void;
  onChange: (description: string) => void;
}

export function AboutSection({ description, onUpdate, onChange }: AboutSectionProps) {
  return (
    <WidgetContainer title="À propos de vous">
      <ProfileDescription
        initialDescription={description}
        onSave={onUpdate}
        onChange={onChange}
      />
    </WidgetContainer>
  );
}
