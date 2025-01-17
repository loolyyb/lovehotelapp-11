import { ProfileCard } from "@/components/profiles/ProfileCard";
import { ProfileWithPreferences } from "@/hooks/useProfiles";

interface ProfilesGridProps {
  profiles: ProfileWithPreferences[];
}

export function ProfilesGrid({ profiles }: ProfilesGridProps) {
  if (profiles.length === 0) {
    return (
      <div className="text-center py-12 text-burgundy">
        Aucun profil ne correspond à vos critères de recherche.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {profiles.map(({ profile, preferences }) => (
        <div key={profile.id} className="animate-fadeIn">
          <ProfileCard profile={profile} preferences={preferences} />
        </div>
      ))}
    </div>
  );
}