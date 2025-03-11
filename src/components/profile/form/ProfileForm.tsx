
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
    if (hasChanges) {
      onUpdate(pendingChanges);
      setPendingChanges({});
    }
  };

  const handleCancel = () => {
    setPendingChanges({});
  };

  return (
    <div className="space-y-8 w-full text-[#f3ebad] bg-transparent">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-transparent">
        <div className="space-y-8 bg-transparent">
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

        <div className="space-y-8 bg-transparent">
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
        <div className="fixed bottom-4 right-4 left-4 md:left-auto z-50 flex justify-center md:justify-end gap-4">
          <div className="bg-[#40192C]/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-[#f3ebad]/30 flex gap-4">
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="w-full md:w-auto border-[#f3ebad]/30 text-[#f3ebad] hover:bg-[#f3ebad]/10"
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              className="w-full md:w-auto bg-[#ce0067] text-white hover:bg-[#ce0067]/90"
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
