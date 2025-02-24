
import { useState } from "react";
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
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  profile: any;
  onUpdate: (updates: any) => void;
  isSaving?: boolean;
}

export function ProfileForm({ profile, onUpdate, isSaving = false }: ProfileFormProps) {
  const { preferences, handlePreferenceChange } = usePreferences();
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const hasChanges = Object.keys(pendingChanges).length > 0;

  const handleFieldChange = (field: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (Object.keys(pendingChanges).length > 0) {
      onUpdate(pendingChanges);
      setPendingChanges({});
    }
  };

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
            onChange={(value) => handleFieldChange("description", value)}
          />
          
          <StatusSection
            status={profile?.status}
            onUpdate={(value) => handleFieldChange("status", value)}
            onChange={(value) => handleFieldChange("status", value)}
          />

          <OrientationSection
            orientation={profile?.sexual_orientation}
            onUpdate={(value) => handleFieldChange("sexual_orientation", value)}
            onChange={(value) => handleFieldChange("sexual_orientation", value)}
          />

          <TokensSection
            tokens={profile?.loolyb_tokens}
            onUpdate={(value) => handleFieldChange("loolyb_tokens", value)}
          />
        </div>

        <div className="space-y-8">
          <SeekingSection
            seeking={profile?.seeking}
            status={profile?.status}
            orientation={profile?.sexual_orientation}
            onUpdate={(value) => handleFieldChange("seeking", value)}
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
              onClick={handleSave} 
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
