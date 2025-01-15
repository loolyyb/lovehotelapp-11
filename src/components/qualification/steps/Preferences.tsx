import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PreferencesProps {
  onNext: (data: any) => void;
  formData: any;
  loading?: boolean;
}

export function Preferences({ onNext, formData, loading }: PreferencesProps) {
  const [preferences, setPreferences] = useState<Record<string, string[]>>(
    formData.preferences || {}
  );

  const togglePreference = (category: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: prev[category]?.includes(value)
        ? prev[category].filter(p => p !== value)
        : [...(prev[category] || []), value]
    }));
  };

  const handleSubmit = () => {
    onNext({ preferences });
  };

  const categories = {
    open_curtains: {
      label: "Pour « Rideaux ouverts », avec qui souhaitez-vous partager cette expérience ?",
      options: [
        { id: "couples", label: "Couples" },
        { id: "single_men", label: "Hommes seuls" },
        { id: "single_women", label: "Femmes seules" }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {Object.entries(categories).map(([category, { label, options }]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-lg font-semibold text-burgundy">{label}</h2>
            <div className="space-y-3">
              {options.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${category}-${option.id}`}
                    checked={preferences[category]?.includes(option.id)}
                    onCheckedChange={() => togglePreference(category, option.id)}
                  />
                  <Label htmlFor={`${category}-${option.id}`}>{option.label}</Label>
                </div>
              ))}
            </div>
          </div>
        ))}
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