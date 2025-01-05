import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Heart, Camera, Prison } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileRelationshipTypeProps {
  relationshipType?: string[] | null;
  onRelationshipTypeChange: (types: string[]) => void;
}

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
        <div className="flex items-center space-x-2">
          <Checkbox
            id="casual"
            checked={relationshipType?.includes('casual')}
            onCheckedChange={(checked) => handleTypeChange('casual', checked as boolean)}
          />
          <Label htmlFor="casual" className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-blue-500 fill-current" />
            D'un soir
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="serious"
            checked={relationshipType?.includes('serious')}
            onCheckedChange={(checked) => handleTypeChange('serious', checked as boolean)}
          />
          <Label htmlFor="serious" className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400 fill-current" />
            Sérieux
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="libertine"
            checked={relationshipType?.includes('libertine')}
            onCheckedChange={(checked) => handleTypeChange('libertine', checked as boolean)}
          />
          <Label htmlFor="libertine" className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-600 fill-current" />
            Libertine
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="bdsm"
            checked={relationshipType?.includes('bdsm')}
            onCheckedChange={(checked) => handleTypeChange('bdsm', checked as boolean)}
          />
          <Label htmlFor="bdsm" className="flex items-center gap-2">
            <Prison className="w-4 h-4 text-purple-600 fill-current" />
            BDSM
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="exhibitionist"
            checked={relationshipType?.includes('exhibitionist')}
            onCheckedChange={(checked) => handleTypeChange('exhibitionist', checked as boolean)}
          />
          <Label htmlFor="exhibitionist" className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-purple-500 fill-current" />
            Exhibitionnisme / Book photo
          </Label>
        </div>
      </div>
    </div>
  );
}