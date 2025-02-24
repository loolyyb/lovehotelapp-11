import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { QualificationJourney } from "@/components/qualification/QualificationJourney";
import { useNotificationSubscription } from "@/hooks/useNotificationSubscription";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface AccountTabProps {
  profile: any;
  onUpdate: (updates: any) => void;
  setHasUnsavedChanges: (value: boolean) => void;
}

export function AccountTab({
  profile,
  onUpdate,
  setHasUnsavedChanges
}: AccountTabProps) {
  const [showQualification, setShowQualification] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [localUnsavedChanges, setLocalUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  const { isSubscribed, subscribeToNotifications, unsubscribeFromNotifications } = useNotificationSubscription();

  // Mettre à jour le statut des modifications non sauvegardées
  useEffect(() => {
    const hasChanges = fullName !== profile?.full_name;
    setLocalUnsavedChanges(hasChanges);
    setHasUnsavedChanges(hasChanges);
  }, [fullName, profile?.full_name, setHasUnsavedChanges]);

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setFullName(newValue);
  };

  const handleSave = () => {
    if (fullName.trim().length < 2) {
      toast({
        title: "Erreur de validation",
        description: "Le nom doit contenir au moins 2 caractères",
        variant: "destructive"
      });
      return;
    }

    onUpdate({
      full_name: fullName
    });
    setLocalUnsavedChanges(false);
    setHasUnsavedChanges(false);
    toast({
      title: "Modifications enregistrées",
      description: "Vos modifications ont été sauvegardées avec succès."
    });
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
    if (localUnsavedChanges) {
      setShowConfirmDialog(true);
      return null;
    }
    return <QualificationJourney isEditing onComplete={() => setShowQualification(false)} />;
  }

  return (
    <>
      <div className="space-y-8">
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

            {localUnsavedChanges && (
              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} className="bg-[#ce0067] text-zinc-50">
                  Sauvegarder mes modifications
                </Button>
              </div>
            )}

            <div className="pt-4">
              <Button onClick={() => setShowQualification(true)} className="w-full bg-[#ce0067] text-zinc-50">
                Modifier mes réponses de qualification
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifications non sauvegardées</AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter sans sauvegarder ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowConfirmDialog(false);
              setLocalUnsavedChanges(false);
              setHasUnsavedChanges(false);
              setShowQualification(true);
            }}>
              Quitter sans sauvegarder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
