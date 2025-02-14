
import { Search, ChevronDown } from "lucide-react";
import { SearchFilter } from "./filters/SearchFilter";
import { StatusFilter } from "./filters/StatusFilter";
import { OrientationFilter } from "./filters/OrientationFilter";
import { MembershipFilter } from "./filters/MembershipFilter";
import { CurtainsFilter } from "./filters/CurtainsFilter";
import { InterestFilter } from "./filters/InterestFilter";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

type InterestType = "all" | "casual" | "serious" | "libertine" | "bdsm" | "exhibitionist" | "open_curtains" | "speed_dating";
type StatusType = "all" | "single_man" | "married_man" | "single_woman" | "married_woman" | "couple_mf" | "couple_mm" | "couple_ff";

interface MatchingFilterProps {
  selectedInterest: InterestType;
  onInterestChange: (value: InterestType) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  status: StatusType;
  onStatusChange: (value: StatusType) => void;
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
    <Collapsible className="space-y-4 p-4 bg-[#40192C] border-[0.5px] border-[#f3ebad]/30 backdrop-blur-sm rounded-lg hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Search className="w-5 h-5" />
          Filtrer les profils
        </h2>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronDown className="h-4 w-4" />
            <span className="sr-only">Toggle filters</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SearchFilter searchTerm={searchTerm} onSearchChange={onSearchChange} />
          <StatusFilter status={status} onStatusChange={onStatusChange} />
          <OrientationFilter orientation={orientation} onOrientationChange={onOrientationChange} />
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <MembershipFilter 
            membershipTypes={membershipTypes} 
            onMembershipTypesChange={onMembershipTypesChange} 
          />
          <div className="flex items-center gap-4 flex-grow">
            <CurtainsFilter 
              openCurtains={openCurtains} 
              onOpenCurtainsChange={onOpenCurtainsChange} 
            />
            <div className="w-40">
              <InterestFilter 
                selectedInterest={selectedInterest} 
                onInterestChange={onInterestChange} 
              />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
