
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart } from "lucide-react";

interface OrientationFilterProps {
  orientation: string;
  onOrientationChange: (value: string) => void;
}

export function OrientationFilter({ orientation, onOrientationChange }: OrientationFilterProps) {
  return (
    <div className="space-y-2">
      <Select value={orientation} onValueChange={onOrientationChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <SelectValue placeholder="Orientation" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Toutes les orientations</SelectItem>
          <SelectItem value="hetero">Hétérosexuel(le)</SelectItem>
          <SelectItem value="gay">Homosexuel(le)</SelectItem>
          <SelectItem value="bisexual">Bisexuel(le)</SelectItem>
          <SelectItem value="pansexual">Pansexuel(le)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
