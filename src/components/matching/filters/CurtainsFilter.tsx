
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Blinds } from "lucide-react";

interface CurtainsFilterProps {
  openCurtains: boolean;
  onOpenCurtainsChange: (checked: boolean) => void;
}

export function CurtainsFilter({ openCurtains, onOpenCurtainsChange }: CurtainsFilterProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="open-curtains"
        checked={openCurtains}
        onCheckedChange={onOpenCurtainsChange}
        className="data-[state=checked]:bg-[#CD0067]"
      />
      <Label htmlFor="open-curtains" className="flex items-center gap-2 cursor-pointer">
        <Blinds className="w-4 h-4" />
        Rideaux ouverts
      </Label>
    </div>
  );
}
