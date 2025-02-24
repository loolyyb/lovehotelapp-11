
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
  onChange: (field: string, value: any) => void;
  pendingChanges: Record<string, any>;
  isSaving: boolean;
}

export function ProfileForm({ profile, onUpdate, onChange, pendingChanges, isSaving }: ProfileFormProps) {
  const { preferences, handlePreferenceChange } = usePreferences();
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
            onUpdate={(value) => onUpdate({ description: value })}
            onChange={(value) => onChange("description", value)}
          />
          
          <StatusSection
            status={profile?.status}
            onUpdate={(value) => onUpdate({ status: value.status })}
            onChange={(value) => onChange("status", value.status)}
          />

          <OrientationSection
            orientation={profile?.sexual_orientation}
            onUpdate={(value) => onUpdate({ sexual_orientation: value.orientation })}
            onChange={(value) => onChange("sexual_orientation", value.orientation)}
          />

          <TokensSection
            tokens={profile?.loolyb_tokens}
            onUpdate={(value) => onUpdate({ loolyb_tokens: value.loolyb_tokens })}
          />
        </div>

        <div className="space-y-8">
          <SeekingSection
            seeking={profile?.seeking}
            status={profile?.status}
            orientation={profile?.sexual_orientation}
            onUpdate={(value) => onUpdate({ seeking: value.seeking })}
          />

          <RelationshipSection
            relationshipType={profile?.relationship_type}
            onUpdate={(value) => onUpdate({ relationship_type: value })}
          />

          <PreferencesSection
            preferences={preferences}
            onPreferenceChange={handlePreferenceChange}
          />
        </div>
      </div>

      <GallerySection
        photos={profile?.photo_urls}
        onUpdate={(value) => onUpdate({ photo_urls: value })}
      />

      {hasChanges && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto z-50 flex justify-center md:justify-end">
          <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border">
            <Button 
              onClick={() => onUpdate(pendingChanges)} 
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
