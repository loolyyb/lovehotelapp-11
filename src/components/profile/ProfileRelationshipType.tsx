import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileRelationshipTypeProps {
  relationshipType?: string | null;
  onRelationshipTypeChange: (type: string) => void;
}

export function ProfileRelationshipType({ 
  relationshipType, 
  onRelationshipTypeChange 
}: ProfileRelationshipTypeProps) {
  const { toast } = useToast();

  const handleTypeChange = (value: string) => {
    onRelationshipTypeChange(value);
    toast({
      title: "Type de relation mis à jour",
      description: "Vos préférences ont été modifiées avec succès.",
    });
  };

  return (
    <div className="space-y-4">
      <Label>Type de relation recherchée</Label>
      <RadioGroup
        value={relationshipType ?? undefined}
        onValueChange={handleTypeChange}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="casual" id="casual" />
          <Label htmlFor="casual" className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-blue-500" />
            D'un soir
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="serious" id="serious" />
          <Label htmlFor="serious" className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            Sérieux
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="libertine" id="libertine" />
          <Label htmlFor="libertine" className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-600" />
            Libertine
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}