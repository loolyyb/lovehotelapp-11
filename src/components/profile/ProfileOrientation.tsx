
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ProfileOrientationProps {
  orientation?: string | null;
  onOrientationChange: (orientation: string) => void;
}

export function ProfileOrientation({ orientation, onOrientationChange }: ProfileOrientationProps) {
  const [currentOrientation, setCurrentOrientation] = useState(orientation ?? undefined);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentOrientation(orientation ?? undefined);
  }, [orientation]);

  const handleOrientationChange = (value: string) => {
    setCurrentOrientation(value);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (currentOrientation) {
      onOrientationChange(currentOrientation);
      setHasChanges(false);
      toast({
        title: "Orientation mise à jour",
        description: "Votre orientation a été modifiée avec succès.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-gray-800">Orientation sexuelle</Label>
      <RadioGroup
        value={currentOrientation}
        onValueChange={handleOrientationChange}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="hetero" id="hetero" />
          <Label htmlFor="hetero" className="flex items-center gap-2 text-gray-800">
            <Heart className="w-4 h-4" />
            Hétéro
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="gay" id="gay" />
          <Label htmlFor="gay" className="flex items-center gap-2 text-gray-800">
            <Heart className="w-4 h-4" />
            Gay
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bisexual" id="bisexual" />
          <Label htmlFor="bisexual" className="flex items-center gap-2 text-gray-800">
            <Heart className="w-4 h-4" />
            Bisexuel(le)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pansexual" id="pansexual" />
          <Label htmlFor="pansexual" className="flex items-center gap-2 text-gray-800">
            <Heart className="w-4 h-4" />
            Pansexuel(le)
          </Label>
        </div>
      </RadioGroup>
      {hasChanges && (
        <Button onClick={handleSave} className="w-full md:w-auto bg-primary hover:bg-primary/90">
          Enregistrer
        </Button>
      )}
    </div>
  );
}
