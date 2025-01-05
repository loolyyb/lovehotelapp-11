import { ProfileDescription } from "../ProfileDescription";
import { ProfileStatus } from "../ProfileStatus";
import { ProfileOrientation } from "../ProfileOrientation";
import { ProfileSeeking } from "../ProfileSeeking";
import { ProfileRelationshipType } from "../ProfileRelationshipType";
import { ProfilePhotoGallery } from "../ProfilePhotoGallery";

interface ProfileFormProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <ProfileDescription
            initialDescription={profile?.description}
            onSave={(description) => onUpdate({ description })}
          />

          <ProfileStatus
            status={profile?.status}
            onStatusChange={(status) => onUpdate({ status })}
          />

          <ProfileRelationshipType
            relationshipType={profile?.relationship_type?.[0] || null}
            onRelationshipTypeChange={(type) => onUpdate({ relationship_type: [type] })}
          />
        </div>

        <div className="space-y-8">
          <ProfileOrientation
            orientation={profile?.sexual_orientation}
            onOrientationChange={(orientation) => onUpdate({ sexual_orientation: orientation })}
          />

          <ProfileSeeking
            seeking={profile?.seeking}
            status={profile?.status}
            orientation={profile?.sexual_orientation}
            onSeekingChange={(seeking) => onUpdate({ seeking })}
          />
        </div>
      </div>

      <ProfilePhotoGallery
        photos={profile?.photo_urls}
        onPhotosChange={(photos) => onUpdate({ photo_urls: photos })}
      />
    </>
  );
}