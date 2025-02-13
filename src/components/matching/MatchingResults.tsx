
import { Sparkles } from "lucide-react";
import { MatchingCard } from "./MatchingCard";
import { Profile } from "./hooks/useMatchingProfiles";

interface MatchingResultsProps {
  profiles: Profile[];
  onProfileClick: (id: string) => void;
  onMessageClick: (id: string) => void;
}

export function MatchingResults({ profiles, onProfileClick, onMessageClick }: MatchingResultsProps) {
  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-12 h-12 text-burgundy mx-auto mb-4" />
        <p className="text-lg text-burgundy">
          Aucun profil compatible trouvé pour le moment
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Essayez d'ajuster vos filtres pour voir plus de résultats
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {profiles.map((profile, index) => (
        <MatchingCard
          key={profile.id}
          profile={profile}
          onProfileClick={onProfileClick}
          onMessageClick={onMessageClick}
          index={index}
        />
      ))}
    </div>
  );
}
