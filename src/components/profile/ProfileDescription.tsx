
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface ProfileDescriptionProps {
  initialDescription?: string | null;
  onSave: (description: string) => void;
}

export function ProfileDescription({ initialDescription, onSave }: ProfileDescriptionProps) {
  const [description, setDescription] = useState(initialDescription ?? "");
  const [localDescription, setLocalDescription] = useState(description);

  useEffect(() => {
    setDescription(initialDescription ?? "");
    setLocalDescription(initialDescription ?? "");
  }, [initialDescription]);

  useEffect(() => {
    if (localDescription !== description) {
      onSave(localDescription);
    }
  }, [localDescription, description, onSave]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 300) {
      setLocalDescription(newValue);
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
