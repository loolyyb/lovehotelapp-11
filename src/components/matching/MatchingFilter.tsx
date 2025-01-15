import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type InterestType = "all" | "bdsm" | "jacuzzi" | "gastronomie" | "rideaux_ouverts" | "speed_dating" | "libertinage" | "art";

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
          <SelectItem value="bdsm">BDSM</SelectItem>
          <SelectItem value="jacuzzi">Jacuzzi</SelectItem>
          <SelectItem value="gastronomie">Gastronomie</SelectItem>
          <SelectItem value="rideaux_ouverts">Rideaux ouverts</SelectItem>
          <SelectItem value="speed_dating">Speed dating</SelectItem>
          <SelectItem value="libertinage">Libertinage</SelectItem>
          <SelectItem value="art">Rencontres</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}