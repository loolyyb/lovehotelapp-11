
import { ProfileRelationshipType } from "../ProfileRelationshipType";
import { WidgetContainer } from "./WidgetContainer";

interface RelationshipSectionProps {
  relationshipType: string[] | null;
  onUpdate: (updates: any) => void;  // Changed from Promise<void> to void
}

export function RelationshipSection({ relationshipType, onUpdate }: RelationshipSectionProps) {
  return (
    <WidgetContainer title="Type de relation">
      <ProfileRelationshipType
        relationshipType={relationshipType}
        onRelationshipTypeChange={(types) => onUpdate({ relationship_type: types })}
      />
    </WidgetContainer>
  );
}
