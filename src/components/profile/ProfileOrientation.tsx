
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

interface ProfileOrientationProps {
  orientation?: string | null;
  onOrientationChange: (orientation: string) => void;
  onChange: (orientation: string) => void;  // Add onChange prop
}

export function ProfileOrientation({ 
  orientation, 
  onOrientationChange,
  onChange 
}: ProfileOrientationProps) {
  const [currentOrientation, setCurrentOrientation] = useState(orientation ?? undefined);

  useEffect(() => {
    setCurrentOrientation(orientation ?? undefined);
  }, [orientation]);

  const handleOrientationChange = (value: string) => {
    setCurrentOrientation(value);
    onChange(value);
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
    </div>
  );
}
