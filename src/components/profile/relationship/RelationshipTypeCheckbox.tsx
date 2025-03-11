
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";

interface RelationshipTypeCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon: LucideIcon;
  iconColor: string;
}

export function RelationshipTypeCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  icon: Icon,
  iconColor,
}: RelationshipTypeCheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
        className="border-[#f3ebad]/50"
      />
      <Label htmlFor={id} className="flex items-center gap-2 text-[#f3ebad]">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        {label}
      </Label>
    </div>
  );
}
