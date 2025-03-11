
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { WidgetContainer } from "./WidgetContainer";

interface LocationSectionProps {
  preferences: any;
  onPreferenceChange: (updates: any) => void;
}

export function LocationSection({ preferences, onPreferenceChange }: LocationSectionProps) {
  const parisLocations = [
    { value: "paris-chatelet", label: "Paris Châtelet" },
    { value: "paris-pigalle", label: "Paris Pigalle" }
  ];

  return (
    <WidgetContainer title="Localisation">
      <div className="space-y-4">
        <Label htmlFor="location" className="text-white">Quartier</Label>
        <Select
          value={preferences?.location}
          onValueChange={(value) => onPreferenceChange({ location: value })}
        >
          <SelectTrigger className="w-full bg-white/10 text-white border-white/30">
            <SelectValue placeholder="Sélectionnez votre quartier" />
          </SelectTrigger>
          <SelectContent className="bg-[#40192C] border-white/30 text-white">
            {parisLocations.map((location) => (
              <SelectItem key={location.value} value={location.value} className="text-white focus:bg-white/10 focus:text-white">
                {location.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </WidgetContainer>
  );
}
