
import { Badge } from "@/components/ui/badge";

interface MembershipFilterProps {
  membershipTypes: string[];
  onMembershipTypesChange: (types: string[]) => void;
}

export function MembershipFilter({ membershipTypes, onMembershipTypesChange }: MembershipFilterProps) {
  const toggleMembershipType = (type: string) => {
    const newTypes = membershipTypes.includes(type)
      ? membershipTypes.filter(t => t !== type)
      : [...membershipTypes, type];
    onMembershipTypesChange(newTypes);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={membershipTypes.includes("loolyb") ? "default" : "outline"}
        className="cursor-pointer hover:bg-rose"
        onClick={() => toggleMembershipType("loolyb")}
      >
        LooLyb Holder
      </Badge>
    </div>
  );
}
