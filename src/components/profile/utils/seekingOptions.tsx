import { User, Users } from "lucide-react";
import { SeekingOption } from "../types/seeking.types";

export const getAvailableOptions = (status: string | null, orientation: string | null): SeekingOption[] => {
  if (!status || !orientation) return [];

  const options: SeekingOption[] = [];

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
  } else if (["bisexual", "pansexual"].includes(orientation)) {
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