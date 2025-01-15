import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PersonalStatusProps {
  onNext: (data: any) => void;
  formData: any;
  loading?: boolean;
}

export function PersonalStatus({ onNext, formData, loading }: PersonalStatusProps) {
  const [status, setStatus] = useState(formData.status || "");

  const handleSubmit = () => {
    if (status) {
      onNext({ status });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-burgundy">
          Quel est votre statut ?
        </h2>

        <RadioGroup
          value={status}
          onValueChange={setStatus}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single_man" id="single_man" />
            <Label htmlFor="single_man">Homme seul</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single_woman" id="single_woman" />
            <Label htmlFor="single_woman">Femme seule</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="couple" id="couple" />
            <Label htmlFor="couple">Couple</Label>
          </div>
        </RadioGroup>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={!status || loading}
      >
        Suivant
      </Button>
    </div>
  );
}