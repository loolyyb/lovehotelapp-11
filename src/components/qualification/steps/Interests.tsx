import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface InterestsProps {
  onNext: (data: any) => void;
  formData: any;
  loading?: boolean;
}

export function Interests({ onNext, formData, loading }: InterestsProps) {
  const [interests, setInterests] = useState<string[]>(formData.interests || []);

  const toggleInterest = (value: string) => {
    setInterests(prev => 
      prev.includes(value)
        ? prev.filter(i => i !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = () => {
    onNext({ interests });
  };

  const options = [
    { id: "exhibition", label: "Exhibition" },
    { id: "voyeurism", label: "Voyeurisme" },
    { id: "photography", label: "Photographie" }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-burgundy">
          Quels sont vos centres d'intérêt ?
        </h2>

        <div className="space-y-3">
          {options.map(option => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={option.id}
                checked={interests.includes(option.id)}
                onCheckedChange={() => toggleInterest(option.id)}
              />
              <Label htmlFor={option.id}>{option.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={loading}
      >
        Suivant
      </Button>
    </div>
  );
}