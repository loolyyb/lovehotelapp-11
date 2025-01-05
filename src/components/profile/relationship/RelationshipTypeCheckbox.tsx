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
      />
      <Label htmlFor={id} className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconColor} fill-current`} />
        {label}
      </Label>
    </div>
  );
}