
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { QualificationJourney } from "@/components/qualification/QualificationJourney";
import { useNotificationSubscription } from "@/hooks/useNotificationSubscription";

interface AccountTabProps {
  profile: any;
  onUpdate: (updates: any) => void;
}

export function AccountTab({
  profile,
  onUpdate
}: AccountTabProps) {
  const [showQualification, setShowQualification] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const { toast } = useToast();
  const { isSubscribed, subscribeToNotifications, unsubscribeFromNotifications } = useNotificationSubscription();

  // Debounce timer reference
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setFullName(newValue);

    // Clear any existing timeout
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    // Set new timeout
    const newTimeout = setTimeout(() => {
      if (newValue !== profile?.full_name && newValue.trim().length >= 2) {
        onUpdate({
          full_name: newValue
        });
        toast({
          title: "Nom mis à jour",
          description: "Votre nom a été modifié avec succès."
        });
      }
    }, 1000); // Délai de 1 seconde

    setUpdateTimeout(newTimeout);
  };

  const handleDatingProfileChange = (checked: boolean) => {
    onUpdate({
      visibility: checked ? 'public' : 'private'
    });
    toast({
      title: checked ? "Profil de rencontre activé" : "Profil de rencontre désactivé",
      description: checked ? "Votre profil est maintenant visible dans la section Rencontres" : "Votre profil n'est plus visible dans la section Rencontres"
    });
  };

  const handleNotificationChange = (checked: boolean) => {
    if (checked) {
      subscribeToNotifications();
    } else {
      unsubscribeFromNotifications();
    }
  };

  if (showQualification) {
    return <QualificationJourney isEditing onComplete={() => setShowQualification(false)} />;
  }

  return <div className="space-y-8">
      <Card className="bg-[#40192C] border-[0.5px] border-[#f3ebad]/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <div className="p-6 space-y-6">
          <div>
            <Label htmlFor="full-name" className="text-white">Nom complet</Label>
            <Input 
              id="full-name" 
              value={fullName} 
              onChange={handleFullNameChange} 
              placeholder="Votre nom complet"
              minLength={2}
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input id="email" type="email" value={profile?.email || ""} disabled className="bg-gray-100" />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="dating-profile" className="flex-1 text-white">
              Connecter mon profil aux sites de rencontre et rideaux ouverts
              <p className="text-sm text-gray-300 mt-1">
                Activez cette option pour rendre votre profil visible dans la section Rencontres et accéder à l'option Rideaux ouverts
              </p>
            </Label>
            <Switch id="dating-profile" checked={profile?.visibility === 'public'} onCheckedChange={handleDatingProfileChange} />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="push-notifications" className="flex-1 text-white">
              Notifications push
              <p className="text-sm text-gray-300 mt-1">
                Recevez des notifications même lorsque l'application est fermée
              </p>
            </Label>
            <Switch 
              id="push-notifications" 
              checked={isSubscribed} 
              onCheckedChange={handleNotificationChange}
            />
          </div>

          <div className="pt-4">
            <Button onClick={() => setShowQualification(true)} className="w-full bg-[#ce0067] text-zinc-50">
              Modifier mes réponses de qualification
            </Button>
          </div>
        </div>
      </Card>
    </div>;
}
