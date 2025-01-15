import { Search } from "lucide-react";
import { SearchFilter } from "./filters/SearchFilter";
import { LocationFilter } from "./filters/LocationFilter";
import { StatusFilter } from "./filters/StatusFilter";
import { OrientationFilter } from "./filters/OrientationFilter";
import { MembershipFilter } from "./filters/MembershipFilter";
import { CurtainsFilter } from "./filters/CurtainsFilter";
import { InterestFilter } from "./filters/InterestFilter";

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
  return (
    <div className="space-y-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-burgundy flex items-center gap-2">
          <Search className="w-5 h-5" />
          Filtrer les profils
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SearchFilter searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <LocationFilter location={location} onLocationChange={onLocationChange} />
        <StatusFilter status={status} onStatusChange={onStatusChange} />
        <OrientationFilter orientation={orientation} onOrientationChange={onOrientationChange} />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <MembershipFilter 
          membershipTypes={membershipTypes} 
          onMembershipTypesChange={onMembershipTypesChange} 
        />
        <CurtainsFilter 
          openCurtains={openCurtains} 
          onOpenCurtainsChange={onOpenCurtainsChange} 
        />
      </div>

      <InterestFilter 
        selectedInterest={selectedInterest} 
        onInterestChange={onInterestChange} 
      />
    </div>
  );
}