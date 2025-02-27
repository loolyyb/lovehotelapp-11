
import { Card } from "@/components/ui/card";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./tabs/ProfileTabs";

interface ProfileContainerProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
  isSaving?: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
}

export function ProfileContainer({ profile, onUpdate, isSaving = false, setHasUnsavedChanges }: ProfileContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-champagne via-rose-50 to-cream">
      <div className="container mx-auto px-4 py-4">
        <Card className="p-8 space-y-8 bg-[#40192C] border-[0.5px] border-[#f3ebad]/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300 rounded-xl animate-fadeIn">
          <ProfileHeader
            avatarUrl={profile?.avatar_url}
            fullName={profile?.full_name}
            bio={profile?.bio}
            canEdit={true}
            onAvatarChange={(url) => onUpdate({ avatar_url: url })}
            sexualOrientation={profile?.sexual_orientation}
            seeking={profile?.seeking}
            relationshipType={profile?.relationship_type}
            status={profile?.status}
          />

          <ProfileTabs 
            profile={profile} 
            onUpdate={onUpdate} 
            isSaving={isSaving} 
            setHasUnsavedChanges={setHasUnsavedChanges} 
          />
        </Card>
      </div>
    </div>
  );
}
