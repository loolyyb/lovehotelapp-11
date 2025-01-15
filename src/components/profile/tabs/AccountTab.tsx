import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QualificationJourney } from "@/components/qualification/QualificationJourney";

interface AccountTabProps {
  profile: any;
  onUpdate: (updates: any) => void;
}

export function AccountTab({ profile, onUpdate }: AccountTabProps) {
  const [showQualification, setShowQualification] = useState(false);
  const { toast } = useToast();

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ full_name: event.target.value });
    toast({
      title: "Nom mis à jour",
      description: "Votre nom a été modifié avec succès.",
    });
  };

  if (showQualification) {
    return <QualificationJourney isEditing onComplete={() => setShowQualification(false)} />;
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="full-name">Nom complet</Label>
            <Input
              id="full-name"
              value={profile?.full_name || ""}
              onChange={handleFullNameChange}
              placeholder="Votre nom complet"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ""}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div className="pt-4">
            <Button
              onClick={() => setShowQualification(true)}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white"
            >
              Modifier mes réponses de qualification
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}