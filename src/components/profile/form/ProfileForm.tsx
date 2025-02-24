
import { usePreferences } from "../hooks/usePreferences";
import { AboutSection } from "./AboutSection";
import { StatusSection } from "./StatusSection";
import { OrientationSection } from "./OrientationSection";
import { SeekingSection } from "./SeekingSection";
import { RelationshipSection } from "./RelationshipSection";
import { PreferencesSection } from "./PreferencesSection";
import { TokensSection } from "./TokensSection";
import { GallerySection } from "./GallerySection";
import { LocationSection } from "./LocationSection";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const { preferences, handlePreferenceChange } = usePreferences();
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (field: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;

    setIsSaving(true);
    try {
      await onUpdate(pendingChanges);
      setPendingChanges({});
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="space-y-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <LocationSection 
            preferences={preferences}
            onPreferenceChange={handlePreferenceChange}
          />
          
          <AboutSection 
            description={profile?.description}
            onUpdate={(value) => handleFieldChange("description", value)}
          />
          
          <StatusSection
            status={profile?.status}
            onUpdate={(value) => handleFieldChange("status", value.status)}
          />

          <OrientationSection
            orientation={profile?.sexual_orientation}
            onUpdate={(value) => handleFieldChange("sexual_orientation", value.orientation)}
          />

          <TokensSection
            tokens={profile?.loolyb_tokens}
            onUpdate={(value) => handleFieldChange("loolyb_tokens", value.loolyb_tokens)}
          />
        </div>

        <div className="space-y-8">
          <SeekingSection
            seeking={profile?.seeking}
            status={profile?.status}
            orientation={profile?.sexual_orientation}
            onUpdate={(value) => handleFieldChange("seeking", value.seeking)}
          />

          <RelationshipSection
            relationshipType={profile?.relationship_type}
            onUpdate={(value) => handleFieldChange("relationship_type", value)}
          />

          <PreferencesSection
            preferences={preferences}
            onPreferenceChange={handlePreferenceChange}
          />
        </div>
      </div>

      <GallerySection
        photos={profile?.photo_urls}
        onUpdate={(value) => handleFieldChange("photo_urls", value)}
      />

      {hasChanges && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto z-50 flex justify-center md:justify-end">
          <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border">
            <Button 
              onClick={handleSaveChanges} 
              className="w-full md:w-auto bg-primary hover:bg-primary/90"
              disabled={isSaving}
            >
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
