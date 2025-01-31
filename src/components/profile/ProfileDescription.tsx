import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ProfileDescriptionProps {
  initialDescription?: string | null;
  onSave: (description: string) => void;
}

export function ProfileDescription({ initialDescription, onSave }: ProfileDescriptionProps) {
  const [description, setDescription] = useState(initialDescription ?? "");
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 300) {
      setDescription(e.target.value);
      onSave(e.target.value);
      toast({
        title: "Description mise à jour",
        description: "Votre description a été enregistrée avec succès.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="description">Description (300 caractères max)</Label>
      <Textarea
        id="description"
        value={description}
        onChange={handleChange}
        placeholder="Décrivez-vous en quelques mots..."
        className="min-h-[100px]"
      />
      <p className="text-sm text-gray-500 text-right">
        {description.length}/300 caractères
      </p>
    </div>
  );
}