import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User, Users } from "lucide-react";
import { useState, useEffect } from "react";

interface ProfileStatusProps {
  status?: string | null;
  onStatusChange: (status: string) => void;
  onChange: (status: string) => void;
}

export function ProfileStatus({ status, onStatusChange, onChange }: ProfileStatusProps) {
  const [localStatus, setLocalStatus] = useState(status ?? undefined);

  useEffect(() => {
    setLocalStatus(status ?? undefined);
  }, [status]);

  const handleStatusChange = (value: string) => {
    setLocalStatus(value);
    onChange(value);
  };

  return (
    <div className="space-y-4">
      <Label className="text-gray-800">Statut</Label>
      <Select value={localStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionnez votre statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="single_man">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Homme célibataire</span>
            </div>
          </SelectItem>
          <SelectItem value="married_man">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Homme en couple</span>
            </div>
          </SelectItem>
          <SelectItem value="single_woman">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Femme célibataire</span>
            </div>
          </SelectItem>
          <SelectItem value="married_woman">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Femme en couple</span>
            </div>
          </SelectItem>
          <SelectItem value="couple_mf">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Couple (homme-femme)</span>
            </div>
          </SelectItem>
          <SelectItem value="couple_mm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Couple (homme-homme)</span>
            </div>
          </SelectItem>
          <SelectItem value="couple_ff">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Couple (femme-femme)</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
