import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

interface LocationFilterProps {
  location: string;
  onLocationChange: (value: string) => void;
}

export function LocationFilter({ location, onLocationChange }: LocationFilterProps) {
  return (
    <div className="space-y-2">
      <Select value={location} onValueChange={onLocationChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <SelectValue placeholder="Localisation" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paris-chatelet">Paris Châtelet</SelectItem>
          <SelectItem value="paris-pigalle">Paris Pigalle</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}