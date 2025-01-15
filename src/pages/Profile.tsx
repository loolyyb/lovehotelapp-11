import { useProfileData } from "@/components/profile/hooks/useProfileData";
import { ProfileLoadingState } from "@/components/profile/loading/ProfileLoadingState";
import { ProfileContainer } from "@/components/profile/ProfileContainer";
import { QualificationCheck } from "@/components/profile/QualificationCheck";

export default function Profile() {
  const { profile, loading, updateProfile } = useProfileData();

  if (loading) {
    return <ProfileLoadingState />;
  }

  return (
    <QualificationCheck userId={profile.user_id}>
      <ProfileContainer profile={profile} onUpdate={updateProfile} />
    </QualificationCheck>
  );
}