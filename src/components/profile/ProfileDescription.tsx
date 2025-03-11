
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProfileDescriptionProps {
  initialDescription: string | null;
  onSave: (description: string) => void;
  onChange: (description: string) => void;
}

export function ProfileDescription({ initialDescription, onSave, onChange }: ProfileDescriptionProps) {
  const [description, setDescription] = useState(initialDescription || "");
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setDescription(initialDescription || "");
  }, [initialDescription]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    onChange(e.target.value);
    setHasChanges(true);
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
      <Textarea
        placeholder="Décrivez-vous en quelques mots..."
        value={description}
        onChange={handleDescriptionChange}
        className="min-h-[150px] bg-white/10 text-[#f3ebad] border-[#f3ebad]/30 resize-none"
      />
      {hasChanges && (
        <Button onClick={handleSave} className="w-full md:w-auto bg-[#ce0067] text-white hover:bg-[#ce0067]/90">
          Enregistrer les modifications
        </Button>
      )}
    </div>
  );
}
