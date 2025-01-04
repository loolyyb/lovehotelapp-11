import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User, Users } from "lucide-react";

interface ProfileStatusProps {
  status?: string | null;
  onStatusChange: (status: string) => void;
}

export function ProfileStatus({ status, onStatusChange }: ProfileStatusProps) {
  return (
    <div className="space-y-4">
      <Label>Statut</Label>
      <Select value={status ?? undefined} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionnez votre statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="single_man">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Homme seul</span>
            </div>
          </SelectItem>
          <SelectItem value="single_woman">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Femme seule</span>
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