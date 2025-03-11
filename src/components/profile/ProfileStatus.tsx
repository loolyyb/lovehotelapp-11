
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { User, Users, Heart } from "lucide-react";

interface ProfileStatusProps {
  status?: string | null;
  onStatusChange: (status: string) => void;
  onChange: (status: string) => void;
}

export function ProfileStatus({ status, onStatusChange, onChange }: ProfileStatusProps) {
  const [currentStatus, setCurrentStatus] = useState(status ?? undefined);

  useEffect(() => {
    setCurrentStatus(status ?? undefined);
  }, [status]);

  const handleStatusChange = (value: string) => {
    setCurrentStatus(value);
    onChange(value);
  };

  return (
    <div className="space-y-4">
      <Label className="text-[#f3ebad]">Votre statut relationnel</Label>
      <RadioGroup
        value={currentStatus}
        onValueChange={handleStatusChange}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="single" id="single" className="border-[#f3ebad]/50 text-[#f3ebad]" />
          <Label htmlFor="single" className="flex items-center gap-2 text-[#f3ebad]">
            <User className="w-4 h-4" />
            Célibataire
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="couple" id="couple" className="border-[#f3ebad]/50 text-[#f3ebad]" />
          <Label htmlFor="couple" className="flex items-center gap-2 text-[#f3ebad]">
            <Users className="w-4 h-4" />
            En couple
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="poly" id="poly" className="border-[#f3ebad]/50 text-[#f3ebad]" />
          <Label htmlFor="poly" className="flex items-center gap-2 text-[#f3ebad]">
            <Heart className="w-4 h-4" />
            Polyamoureux(se)
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
