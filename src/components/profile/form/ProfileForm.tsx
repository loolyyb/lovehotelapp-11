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

interface ProfileFormProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const { preferences, handlePreferenceChange } = usePreferences();

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
            onUpdate={onUpdate}
          />
          
          <StatusSection
            status={profile?.status}
            onUpdate={onUpdate}
          />

          <OrientationSection
            orientation={profile?.sexual_orientation}
            onUpdate={onUpdate}
          />

          <TokensSection
            tokens={profile?.loolyb_tokens}
            onUpdate={onUpdate}
          />
        </div>

        <div className="space-y-8">
          <SeekingSection
            seeking={profile?.seeking}
            status={profile?.status}
            orientation={profile?.sexual_orientation}
            onUpdate={onUpdate}
          />

          <RelationshipSection
            relationshipType={profile?.relationship_type}
            onUpdate={onUpdate}
          />

          <PreferencesSection
            preferences={preferences}
            onPreferenceChange={handlePreferenceChange}
          />
        </div>
      </div>

      <GallerySection
        photos={profile?.photo_urls}
        onUpdate={onUpdate}
      />
    </div>
  );
}