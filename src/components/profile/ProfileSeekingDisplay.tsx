import { Card } from "@/components/ui/card";
import { User, Users } from "lucide-react";

interface ProfileSeekingDisplayProps {
  seeking?: string[] | null;
}

export function ProfileSeekingDisplay({ seeking }: ProfileSeekingDisplayProps) {
  if (!seeking || seeking.length === 0) {
    return null;
  }

  const getSeekingLabel = (value: string) => {
    switch (value) {
      case "single_man":
        return { label: "Un homme", icon: <User className="w-4 h-4" /> };
      case "single_woman":
        return { label: "Une femme", icon: <User className="w-4 h-4" /> };
      case "couple_mf":
        return { label: "Un couple (homme-femme)", icon: <Users className="w-4 h-4" /> };
      case "couple_mm":
        return { label: "Un couple (homme-homme)", icon: <Users className="w-4 h-4" /> };
      case "couple_ff":
        return { label: "Un couple (femme-femme)", icon: <Users className="w-4 h-4" /> };
      default:
        return { label: value, icon: <User className="w-4 h-4" /> };
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-burgundy mb-4">Recherche</h2>
      <Card className="p-6">
        <div className="space-y-2">
          {seeking.map((item) => {
            const { label, icon } = getSeekingLabel(item);
            return (
              <div key={item} className="flex items-center gap-2 text-gray-700">
                {icon}
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}