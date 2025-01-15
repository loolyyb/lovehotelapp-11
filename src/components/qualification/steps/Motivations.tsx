import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MotivationsProps {
  onNext: (data: any) => void;
  formData: any;
  loading?: boolean;
}

export function Motivations({ onNext, formData, loading }: MotivationsProps) {
  const [motivations, setMotivations] = useState<string[]>(formData.motivations || []);

  const toggleMotivation = (value: string) => {
    setMotivations(prev => 
      prev.includes(value)
        ? prev.filter(m => m !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = () => {
    if (motivations.length > 0) {
      onNext({ motivations });
    }
  };

  const options = [
    { id: "serious", label: "Relations sérieuses" },
    { id: "casual", label: "Rencontres casual" },
    { id: "libertine", label: "Libertinage" },
    { id: "bdsm", label: "BDSM" },
    { id: "open_curtains", label: "Rideaux ouverts" }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-burgundy">
          Que recherchez-vous principalement ?
        </h2>

        <div className="space-y-3">
          {options.map(option => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={option.id}
                checked={motivations.includes(option.id)}
                onCheckedChange={() => toggleMotivation(option.id)}
              />
              <Label htmlFor={option.id}>{option.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={motivations.length === 0 || loading}
      >
        Suivant
      </Button>
    </div>
  );
}