import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { User, Users } from "lucide-react";

interface ProfileSeekingProps {
  seeking?: string[] | null;
  status?: string | null;
  orientation?: string | null;
  onSeekingChange: (seeking: string[]) => void;
}

export function ProfileSeeking({ seeking, status, orientation, onSeekingChange }: ProfileSeekingProps) {
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
  };

  const getAvailableOptions = () => {
    if (!status || !orientation) return [];

    const options: Array<{ value: string; label: string; icon: JSX.Element }> = [];

    if (orientation === "hetero") {
      if (status === "single_man") {
        options.push(
          { value: "single_woman", label: "Une femme", icon: <User className="w-4 h-4" /> },
          { value: "couple_mf", label: "Un couple (homme-femme)", icon: <Users className="w-4 h-4" /> }
        );
      } else if (status === "single_woman") {
        options.push(
          { value: "single_man", label: "Un homme", icon: <User className="w-4 h-4" /> },
          { value: "couple_mf", label: "Un couple (homme-femme)", icon: <Users className="w-4 h-4" /> }
        );
      }
    } else if (orientation === "gay") {
      if (status === "single_man") {
        options.push(
          { value: "single_man", label: "Un homme", icon: <User className="w-4 h-4" /> },
          { value: "couple_mm", label: "Un couple (homme-homme)", icon: <Users className="w-4 h-4" /> }
        );
      } else if (status === "single_woman") {
        options.push(
          { value: "single_woman", label: "Une femme", icon: <User className="w-4 h-4" /> },
          { value: "couple_ff", label: "Un couple (femme-femme)", icon: <Users className="w-4 h-4" /> }
        );
      }
    } else if (orientation === "bisexual") {
      options.push(
        { value: "single_man", label: "Un homme", icon: <User className="w-4 h-4" /> },
        { value: "single_woman", label: "Une femme", icon: <User className="w-4 h-4" /> },
        { value: "couple_mf", label: "Un couple (homme-femme)", icon: <Users className="w-4 h-4" /> },
        { value: "couple_mm", label: "Un couple (homme-homme)", icon: <Users className="w-4 h-4" /> },
        { value: "couple_ff", label: "Un couple (femme-femme)", icon: <Users className="w-4 h-4" /> }
      );
    }

    return options;
  };

  const options = getAvailableOptions();

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