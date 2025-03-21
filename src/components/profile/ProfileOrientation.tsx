
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

interface ProfileOrientationProps {
  orientation?: string | null;
  onOrientationChange: (orientation: string) => void;
  onChange: (orientation: string) => void;
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
      <Label className="text-[#f3ebad]">Orientation sexuelle</Label>
      <RadioGroup
        value={currentOrientation}
        onValueChange={handleOrientationChange}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="hetero" id="hetero" className="border-[#f3ebad]/50 text-[#f3ebad]" />
          <Label htmlFor="hetero" className="flex items-center gap-2 text-[#f3ebad]">
            <Heart className="w-4 h-4" />
            Hétéro
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="gay" id="gay" className="border-[#f3ebad]/50 text-[#f3ebad]" />
          <Label htmlFor="gay" className="flex items-center gap-2 text-[#f3ebad]">
            <Heart className="w-4 h-4" />
            Gay
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bisexual" id="bisexual" className="border-[#f3ebad]/50 text-[#f3ebad]" />
          <Label htmlFor="bisexual" className="flex items-center gap-2 text-[#f3ebad]">
            <Heart className="w-4 h-4" />
            Bisexuel(le)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pansexual" id="pansexual" className="border-[#f3ebad]/50 text-[#f3ebad]" />
          <Label htmlFor="pansexual" className="flex items-center gap-2 text-[#f3ebad]">
            <Heart className="w-4 h-4" />
            Pansexuel(le)
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
