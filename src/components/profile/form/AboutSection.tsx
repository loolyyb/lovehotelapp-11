import { ProfileDescription } from "../ProfileDescription";
import { motion } from "framer-motion";
import { WidgetContainer } from "./WidgetContainer";

interface AboutSectionProps {
  description: string | null;
  onUpdate: (updates: any) => Promise<void>;
}

export function AboutSection({ description, onUpdate }: AboutSectionProps) {
  return (
    <WidgetContainer title="À propos de vous">
      <ProfileDescription
        initialDescription={description}
        onSave={(description) => onUpdate({ description })}
      />
    </WidgetContainer>
  );
}