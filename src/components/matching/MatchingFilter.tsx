import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type InterestType = "all" | "casual" | "serious" | "libertine" | "bdsm" | "exhibitionist" | "open_curtains" | "speed_dating";

interface MatchingFilterProps {
  selectedInterest: InterestType;
  onInterestChange: (value: InterestType) => void;
}

export function MatchingFilter({ selectedInterest, onInterestChange }: MatchingFilterProps) {
  return (
    <div className="mb-8 w-full max-w-md mx-auto">
      <Select value={selectedInterest} onValueChange={onInterestChange}>
        <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm">
          <SelectValue placeholder="Filtrer par intérêt" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les intérêts</SelectItem>
          <SelectItem value="casual">D'un soir</SelectItem>
          <SelectItem value="serious">Relations sérieuses</SelectItem>
          <SelectItem value="libertine">Libertine</SelectItem>
          <SelectItem value="bdsm">BDSM</SelectItem>
          <SelectItem value="exhibitionist">Exhibitionnisme</SelectItem>
          <SelectItem value="open_curtains">Rideaux ouverts</SelectItem>
          <SelectItem value="speed_dating">Speed dating</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}