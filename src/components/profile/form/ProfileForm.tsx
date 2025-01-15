import { usePreferences } from "../hooks/usePreferences";
import { AboutSection } from "./AboutSection";
import { StatusSection } from "./StatusSection";
import { RelationshipSection } from "./RelationshipSection";
import { TokensSection } from "./TokensSection";
import { OrientationSection } from "./OrientationSection";
import { SeekingSection } from "./SeekingSection";
import { PreferencesSection } from "./PreferencesSection";
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

      <TokensSection
        tokens={profile?.loolyb_tokens}
        onUpdate={onUpdate}
      />

      <GallerySection
        photos={profile?.photo_urls}
        onUpdate={onUpdate}
      />
    </div>
  );
}