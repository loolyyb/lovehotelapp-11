import { Card } from "@/components/ui/card";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./tabs/ProfileTabs";

interface ProfileContainerProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function ProfileContainer({ profile, onUpdate }: ProfileContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100">
      <div className="container mx-auto px-4 py-4">
        <Card className="p-8 space-y-8 bg-white/80 backdrop-blur-sm shadow-xl rounded-xl animate-fadeIn">
          <ProfileHeader
            avatarUrl={profile?.avatar_url}
            fullName={profile?.full_name}
            bio={profile?.bio}
            canEdit={true}
            onAvatarChange={(url) => onUpdate({ avatar_url: url })}
            sexualOrientation={profile?.sexual_orientation}
            seeking={profile?.seeking}
            relationshipType={profile?.relationship_type}
          />

          <ProfileTabs profile={profile} onUpdate={onUpdate} />
        </Card>
      </div>
    </div>
  );
}