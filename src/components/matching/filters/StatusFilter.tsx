
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";

type StatusType = "all" | "single_man" | "married_man" | "single_woman" | "married_woman" | "couple_mf" | "couple_mm" | "couple_ff";

interface StatusFilterProps {
  status: StatusType;
  onStatusChange: (value: StatusType) => void;
}

export function StatusFilter({ status, onStatusChange }: StatusFilterProps) {
  return (
    <div className="space-y-2">
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <SelectValue placeholder="Statut" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="single_man">Homme célibataire</SelectItem>
          <SelectItem value="married_man">Homme en couple</SelectItem>
          <SelectItem value="single_woman">Femme célibataire</SelectItem>
          <SelectItem value="married_woman">Femme en couple</SelectItem>
          <SelectItem value="couple_mf">Couple (homme-femme)</SelectItem>
          <SelectItem value="couple_mm">Couple (homme-homme)</SelectItem>
          <SelectItem value="couple_ff">Couple (femme-femme)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
