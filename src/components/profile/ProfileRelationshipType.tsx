import { Label } from "@/components/ui/label";
import { CircleSlash, Users, GenderMale, Mask, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RelationshipTypeCheckbox } from "./relationship/RelationshipTypeCheckbox";

interface ProfileRelationshipTypeProps {
  relationshipType?: string[] | null;
  onRelationshipTypeChange: (types: string[]) => void;
}

const RELATIONSHIP_TYPES = [
  {
    id: "casual",
    label: "D'un soir",
    icon: CircleSlash,
    iconColor: "text-blue-500"
  },
  {
    id: "serious",
    label: "Relations sérieuses",
    icon: Users,
    iconColor: "text-rose-400"
  },
  {
    id: "libertine",
    label: "Libertine",
    icon: GenderMale,
    iconColor: "text-red-600"
  },
  {
    id: "bdsm",
    label: "BDSM",
    icon: Mask,
    iconColor: "text-purple-600"
  },
  {
    id: "exhibitionist",
    label: "Exhibitionnisme / Book photo",
    icon: Camera,
    iconColor: "text-purple-500"
  }
];

export function ProfileRelationshipType({ 
  relationshipType, 
  onRelationshipTypeChange 
}: ProfileRelationshipTypeProps) {
  const { toast } = useToast();

  const handleTypeChange = (value: string, checked: boolean) => {
    const newTypes = relationshipType ? [...relationshipType] : [];
    if (checked) {
      newTypes.push(value);
    } else {
      const index = newTypes.indexOf(value);
      if (index > -1) {
        newTypes.splice(index, 1);
      }
    }
    onRelationshipTypeChange(newTypes);
    toast({
      title: "Type de relation mis à jour",
      description: "Vos préférences ont été modifiées avec succès.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Type de relation ou expérience recherchée</Label>
        <p className="text-sm text-muted-foreground italic">
          (Plusieurs options possibles)
        </p>
      </div>
      <div className="space-y-2">
        {RELATIONSHIP_TYPES.map((type) => (
          <RelationshipTypeCheckbox
            key={type.id}
            id={type.id}
            label={type.label}
            checked={relationshipType?.includes(type.id) ?? false}
            onCheckedChange={(checked) => handleTypeChange(type.id, checked)}
            icon={type.icon}
            iconColor={type.iconColor}
          />
        ))}
      </div>
    </div>
  );
}