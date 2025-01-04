import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";

interface ProfileOrientationProps {
  orientation?: string | null;
  onOrientationChange: (orientation: string) => void;
}

export function ProfileOrientation({ orientation, onOrientationChange }: ProfileOrientationProps) {
  return (
    <div className="space-y-4">
      <Label>Orientation sexuelle</Label>
      <RadioGroup
        value={orientation ?? undefined}
        onValueChange={onOrientationChange}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="hetero" id="hetero" />
          <Label htmlFor="hetero" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Hétéro
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="gay" id="gay" />
          <Label htmlFor="gay" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Gay
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bisexual" id="bisexual" />
          <Label htmlFor="bisexual" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Bisexuel(le)
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}