
import { useState, useEffect } from "react";
import { useProfileData } from "@/components/profile/hooks/useProfileData";
import { ProfileLoadingState } from "@/components/profile/loading/ProfileLoadingState";
import { ProfileContainer } from "@/components/profile/ProfileContainer";
import { useToast } from "@/hooks/use-toast";
import { useBlocker, useBeforeUnload } from "react-router-dom";

export default function Profile() {
  const { profile, loading, updateProfile } = useProfileData();
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();
  
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked" && hasUnsavedChanges) {
      const leave = window.confirm(
        "Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter cette page ?"
      );
      if (leave) {
        setHasUnsavedChanges(false);
        blocker.proceed?.();
      } else {
        blocker.reset?.();
      }
    }
  }, [blocker, hasUnsavedChanges]);

  useBeforeUnload(
    hasUnsavedChanges
      ? (event) => {
          event.preventDefault();
          event.returnValue = "Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter cette page ?";
        }
      : undefined
  );

  const handleUpdate = async (updates: any) => {
    setIsSaving(true);
    try {
      await updateProfile(updates);
      setPendingChanges({});
      setHasUnsavedChanges(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <ProfileLoadingState />;
  }

  return (
    <ProfileContainer 
      profile={profile} 
      onUpdate={handleUpdate}
      isSaving={isSaving}
      setHasUnsavedChanges={setHasUnsavedChanges}
    />
  );
}
