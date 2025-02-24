
import { Label } from "@/components/ui/label";
import { CircleSlash, Users, Users2, Lock, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
    icon: Users2,
    iconColor: "text-red-600"
  },
  {
    id: "bdsm",
    label: "BDSM",
    icon: Lock,
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
  const [currentTypes, setCurrentTypes] = useState<string[]>(relationshipType || []);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentTypes(relationshipType || []);
  }, [relationshipType]);

  const handleTypeChange = (value: string, checked: boolean) => {
    const newTypes = [...currentTypes];
    if (checked) {
      newTypes.push(value);
    } else {
      const index = newTypes.indexOf(value);
      if (index > -1) {
        newTypes.splice(index, 1);
      }
    }
    setCurrentTypes(newTypes);
    setHasChanges(true);
  };

  const handleSave = () => {
    onRelationshipTypeChange(currentTypes);
    setHasChanges(false);
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
            checked={currentTypes.includes(type.id)}
            onCheckedChange={(checked) => handleTypeChange(type.id, checked)}
            icon={type.icon}
            iconColor={type.iconColor}
          />
        ))}
      </div>
      {hasChanges && (
        <Button onClick={handleSave} className="w-full md:w-auto bg-primary hover:bg-primary/90">
          Enregistrer
        </Button>
      )}
    </div>
  );
}
