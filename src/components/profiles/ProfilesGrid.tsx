import { ProfileCard } from "@/components/profiles/ProfileCard";
import { ProfileWithPreferences } from "@/hooks/useProfiles";

interface ProfilesGridProps {
  profiles: ProfileWithPreferences[];
}

export function ProfilesGrid({ profiles }: ProfilesGridProps) {
  // Sort profiles to show "open curtains" first
  const sortedProfiles = [...profiles].sort((a, b) => {
    const aHasOpenCurtains = a.preferences?.open_curtains || a.preferences?.open_curtains_interest;
    const bHasOpenCurtains = b.preferences?.open_curtains || b.preferences?.open_curtains_interest;
    
    if (aHasOpenCurtains && !bHasOpenCurtains) return -1;
    if (!aHasOpenCurtains && bHasOpenCurtains) return 1;
    return 0;
  });

  if (sortedProfiles.length === 0) {
    return (
      <div className="text-center py-12 text-burgundy">
        Aucun profil ne correspond à vos critères de recherche.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {sortedProfiles.map(({ profile, preferences }) => (
        <div key={profile.id} className="animate-fadeIn">
          <ProfileCard profile={profile} preferences={preferences} />
        </div>
      ))}
    </div>
  );
}