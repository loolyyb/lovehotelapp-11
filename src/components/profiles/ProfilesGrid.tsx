
import { useNavigate } from "react-router-dom";
import { MatchingCard } from "@/components/matching/MatchingCard";
import { ProfileWithPreferences } from "@/hooks/useProfiles";

interface ProfilesGridProps {
  profiles: ProfileWithPreferences[];
}

export function ProfilesGrid({ profiles }: ProfilesGridProps) {
  const navigate = useNavigate();

  const handleProfileClick = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  const handleMessageClick = (profileId: string) => {
    navigate(`/messages?profile=${profileId}`);
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12 text-burgundy">
        Aucun profil ne correspond à vos critères de recherche.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {profiles.map(({ profile, compatibility_score }, index) => (
        <MatchingCard
          key={profile.id}
          profile={{
            id: profile.id,
            full_name: profile.full_name || "Anonyme",
            avatar_url: profile.avatar_url || "",
            bio: profile.bio || "",
            compatibility_score: compatibility_score
          }}
          onProfileClick={handleProfileClick}
          onMessageClick={handleMessageClick}
          index={index}
        />
      ))}
    </div>
  );
}
