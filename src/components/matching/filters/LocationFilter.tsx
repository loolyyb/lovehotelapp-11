
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

// Utiliser les mêmes valeurs que dans LocationSection
export const parisLocations = {
  "all": "Toutes les localisations",
  "paris-chatelet": "Paris Châtelet",
  "paris-pigalle": "Paris Pigalle"
} as const;

export type LocationType = keyof typeof parisLocations;

interface LocationFilterProps {
  location: LocationType;
  onLocationChange: (value: LocationType) => void;
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
          {Object.entries(parisLocations).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
