
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface ProfileDescriptionProps {
  initialDescription?: string | null;
  onSave: (description: string) => void;
  onChange: (description: string) => void;
}

export function ProfileDescription({ initialDescription, onSave, onChange }: ProfileDescriptionProps) {
  const [localDescription, setLocalDescription] = useState(initialDescription ?? "");

  useEffect(() => {
    setLocalDescription(initialDescription ?? "");
  }, [initialDescription]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 300) {
      setLocalDescription(newValue);
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="description" className="text-gray-800">
        Description (300 caractères max)
      </Label>
      <Textarea
        id="description"
        value={localDescription}
        onChange={handleChange}
        placeholder="Décrivez-vous en quelques mots..."
        className="min-h-[100px]"
      />
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-800">
          {localDescription.length}/300 caractères
        </p>
      </div>
    </div>
  );
}
