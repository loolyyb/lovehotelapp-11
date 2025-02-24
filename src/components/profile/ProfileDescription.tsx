
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ProfileDescriptionProps {
  initialDescription?: string | null;
  onSave: (description: string) => void;
}

export function ProfileDescription({ initialDescription, onSave }: ProfileDescriptionProps) {
  const [description, setDescription] = useState(initialDescription ?? "");
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 300) {
      setDescription(newValue);
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    onSave(description);
    setHasChanges(false);
    toast({
      title: "Description mise à jour",
      description: "Votre description a été enregistrée avec succès.",
    });
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="description" className="text-gray-800">
        Description (300 caractères max)
      </Label>
      <Textarea
        id="description"
        value={description}
        onChange={handleChange}
        placeholder="Décrivez-vous en quelques mots..."
        className="min-h-[100px]"
      />
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-800">
          {description.length}/300 caractères
        </p>
        {hasChanges && (
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Enregistrer
          </Button>
        )}
      </div>
    </div>
  );
}
