import { useProfileData } from "@/components/profile/hooks/useProfileData";
import { ProfileLoadingState } from "@/components/profile/loading/ProfileLoadingState";
import { ProfileContainer } from "@/components/profile/ProfileContainer";

export default function Profile() {
  const { profile, loading, updateProfile } = useProfileData();

  if (loading) {
    return <ProfileLoadingState />;
  }

  return <ProfileContainer profile={profile} onUpdate={updateProfile} />;
}