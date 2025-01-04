import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, MapPin, Heart, Users, Blinds } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export type FilterCriteria = {
  searchTerm: string;
  location?: string;
  interests?: string[];
  status?: string;
  orientation?: string;
  membershipType?: string[];
  openCurtains?: boolean;
};

interface ProfilesFilterProps {
  onFilterChange: (criteria: FilterCriteria) => void;
}

export function ProfilesFilter({ onFilterChange }: ProfilesFilterProps) {
  const [filters, setFilters] = useState<FilterCriteria>({
    searchTerm: "",
    membershipType: [],
    openCurtains: false,
  });

  const handleFilterChange = (key: keyof FilterCriteria, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleMembershipType = (type: string) => {
    const currentTypes = filters.membershipType || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    handleFilterChange("membershipType", newTypes);
  };

  return (
    <Card className="p-4 mb-6 bg-white/80 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-burgundy" />
          <h2 className="text-lg font-semibold text-burgundy">Filtrer les profils</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Input
              placeholder="Rechercher..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Select
              value={filters.location}
              onValueChange={(value) => handleFilterChange("location", value)}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <SelectValue placeholder="Localisation" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paris">Paris</SelectItem>
                <SelectItem value="lyon">Lyon</SelectItem>
                <SelectItem value="marseille">Marseille</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <SelectValue placeholder="Statut" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_man">Homme célibataire</SelectItem>
                <SelectItem value="single_woman">Femme célibataire</SelectItem>
                <SelectItem value="couple">Couple</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Select
              value={filters.orientation}
              onValueChange={(value) => handleFilterChange("orientation", value)}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <SelectValue placeholder="Orientation" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hetero">Hétérosexuel(le)</SelectItem>
                <SelectItem value="gay">Homosexuel(le)</SelectItem>
                <SelectItem value="bi">Bisexuel(le)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filters.membershipType?.includes("love_hotel") ? "default" : "outline"}
              className="cursor-pointer hover:bg-rose"
              onClick={() => toggleMembershipType("love_hotel")}
            >
              Love Hotel Member
            </Badge>
            <Badge
              variant={filters.membershipType?.includes("loolyb") ? "default" : "outline"}
              className="cursor-pointer hover:bg-rose"
              onClick={() => toggleMembershipType("loolyb")}
            >
              LooLyb Holder
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="open-curtains"
              checked={filters.openCurtains}
              onCheckedChange={(checked) => handleFilterChange("openCurtains", checked)}
            />
            <Label htmlFor="open-curtains" className="flex items-center gap-2 cursor-pointer">
              <Blinds className="w-4 h-4" />
              Rideaux ouverts
            </Label>
          </div>
        </div>
      </div>
    </Card>
  );
}