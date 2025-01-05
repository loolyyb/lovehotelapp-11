import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ProfileSeekingProps } from "./types/seeking.types";
import { getAvailableOptions } from "./utils/seekingOptions";

export function ProfileSeeking({ seeking, status, orientation, onSeekingChange }: ProfileSeekingProps) {
  const { toast } = useToast();

  const handleSeekingChange = (value: string, checked: boolean) => {
    const newSeeking = seeking ? [...seeking] : [];
    if (checked) {
      newSeeking.push(value);
    } else {
      const index = newSeeking.indexOf(value);
      if (index > -1) {
        newSeeking.splice(index, 1);
      }
    }
    onSeekingChange(newSeeking);
    toast({
      title: "Préférences mises à jour",
      description: "Vos préférences de recherche ont été modifiées avec succès.",
    });
  };

  const options = getAvailableOptions(status, orientation);

  if (options.length === 0) {
    return (
      <div className="text-gray-500 italic">
        Veuillez d'abord sélectionner votre statut et votre orientation
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>Je recherche</Label>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={option.value}
              checked={seeking?.includes(option.value)}
              onCheckedChange={(checked) => handleSeekingChange(option.value, checked as boolean)}
            />
            <Label htmlFor={option.value} className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}