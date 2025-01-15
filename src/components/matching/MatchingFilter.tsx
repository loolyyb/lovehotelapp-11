import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, Users, Blinds } from "lucide-react";

type InterestType = "all" | "casual" | "serious" | "libertine" | "bdsm" | "exhibitionist" | "open_curtains" | "speed_dating";

interface MatchingFilterProps {
  selectedInterest: InterestType;
  onInterestChange: (value: InterestType) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  orientation: string;
  onOrientationChange: (value: string) => void;
  membershipTypes: string[];
  onMembershipTypesChange: (types: string[]) => void;
  openCurtains: boolean;
  onOpenCurtainsChange: (checked: boolean) => void;
}

export function MatchingFilter({ 
  selectedInterest,
  onInterestChange,
  searchTerm,
  onSearchChange,
  location,
  onLocationChange,
  status,
  onStatusChange,
  orientation,
  onOrientationChange,
  membershipTypes,
  onMembershipTypesChange,
  openCurtains,
  onOpenCurtainsChange,
}: MatchingFilterProps) {
  const toggleMembershipType = (type: string) => {
    const newTypes = membershipTypes.includes(type)
      ? membershipTypes.filter(t => t !== type)
      : [...membershipTypes, type];
    onMembershipTypesChange(newTypes);
  };

  return (
    <div className="space-y-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-burgundy flex items-center gap-2">
          Filtrer les profils
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Select value={location} onValueChange={onLocationChange}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <SelectValue placeholder="Localisation" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paris-chatelet">Paris Châtelet</SelectItem>
              <SelectItem value="paris-pigalle">Paris Pigalle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <SelectValue placeholder="Statut" />
              </div>
            </SelectTrigger>
            <SelectContent>
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

        <div className="space-y-2">
          <Select value={orientation} onValueChange={onOrientationChange}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <SelectValue placeholder="Orientation" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hetero">Hétérosexuel(le)</SelectItem>
              <SelectItem value="gay">Homosexuel(le)</SelectItem>
              <SelectItem value="bisexual">Bisexuel(le)</SelectItem>
              <SelectItem value="pansexual">Pansexuel(le)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={membershipTypes.includes("love_hotel") ? "default" : "outline"}
            className="cursor-pointer hover:bg-rose"
            onClick={() => toggleMembershipType("love_hotel")}
          >
            Love Hotel Member
          </Badge>
          <Badge
            variant={membershipTypes.includes("loolyb") ? "default" : "outline"}
            className="cursor-pointer hover:bg-rose"
            onClick={() => toggleMembershipType("loolyb")}
          >
            LooLyb Holder
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="open-curtains"
            checked={openCurtains}
            onCheckedChange={onOpenCurtainsChange}
          />
          <Label htmlFor="open-curtains" className="flex items-center gap-2 cursor-pointer">
            <Blinds className="w-4 h-4" />
            Rideaux ouverts
          </Label>
        </div>
      </div>

      <div className="w-full">
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
    </div>
  );
}