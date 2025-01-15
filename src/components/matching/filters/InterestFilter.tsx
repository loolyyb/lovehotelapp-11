import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type InterestType = "all" | "casual" | "serious" | "libertine" | "bdsm" | "exhibitionist" | "open_curtains" | "speed_dating";

interface InterestFilterProps {
  selectedInterest: InterestType;
  onInterestChange: (value: InterestType) => void;
}

export function InterestFilter({ selectedInterest, onInterestChange }: InterestFilterProps) {
  return (
    <Select value={selectedInterest} onValueChange={onInterestChange}>
      <SelectTrigger className="h-9 bg-white/80 backdrop-blur-sm">
        <SelectValue placeholder="Type de relation" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous les types</SelectItem>
        <SelectItem value="casual">D'un soir</SelectItem>
        <SelectItem value="serious">Relations sérieuses</SelectItem>
        <SelectItem value="libertine">Libertine</SelectItem>
        <SelectItem value="bdsm">BDSM</SelectItem>
        <SelectItem value="exhibitionist">Exhibitionnisme</SelectItem>
        <SelectItem value="open_curtains">Rideaux ouverts</SelectItem>
        <SelectItem value="speed_dating">Speed dating</SelectItem>
      </SelectContent>
    </Select>
  );
}